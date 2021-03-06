// editRoomModal.js
//
// A dialog box for editing or viewing the properties of the current
// room. This may also be used as a dialog for creating a new room.

/*global define:true */
define(['jquery', 'util', 'pnut', 'js/core/roomInfo',
        'js/core/UserFields',
        'js/deps/text!template/editRoomModal.html', 'bootstrap'],
function ($, util, pnut, roomInfo, UserFields, editTemplate) {
  'use strict';

  var categories = ['fun', 'lifestyle', 'profession', 'language',
                    'community', 'tech', 'event'];

  var editRoomModal = {
  };

  var editRoomFields = null;
  var editRoomChannel = null;
  var editRoomType = null;

  editRoomModal.init = function ()
  {
    $('#modal-container').append(editTemplate);
    editRoomFields = new UserFields('edit-room');
    $('#edit-room-save').click(clickSave);
    $('#edit-room-deactivate').click(clickDeactivate);
    $('#edit-room-perm').on('change', function (event) {
      updatePatterPerm();
    });
    $('#edit-room-promote').on('change', function (event) {
      updatePatterPerm();
    });
    $('#edit-room-form').on('submit', function (event) {
      event.preventDefault();
      $('#edit-room-save').click();
      return false;
    });
    $('#avatar-form').submit(function (event) {
      event.preventDefault();
//      updateAvatar();
      return false;
    });
  };

  editRoomModal.show = function ()
  {
    $('#edit-room-modal').modal();
  };

  editRoomModal.canEditChannel = function (channel) {
    return typeof channel.is_active === 'undefined' && channel.acl.full.you &&
      (channel.type === 'io.pnut.core.chat' ||
       ! channel.acl.write.immutable ||
       ! channel.acl.read.immutable);
  };

  editRoomModal.update = function (newChannel, newType)
  {
    var i = 0;
    var j = 0;
    editRoomChannel = newChannel;
    editRoomType = newType;
    var canEdit = true;
    if (editRoomChannel !== null) {
      canEdit = this.canEditChannel(editRoomChannel);
      editRoomType = editRoomChannel.type;
    }
    var settings = pnut.note.findPatterSettings(editRoomChannel);

    // Modal Title
    var roomType = 'Create ';
    if (editRoomChannel !== null && canEdit) {
      roomType = 'Edit ';
    } else if (editRoomChannel !== null) {
      roomType = 'View ';
    }
    if (editRoomType === 'io.pnut.core.chat') {
      roomType += 'Chat Room';
    } else if (editRoomType === 'io.pnut.core.pm') {
      roomType += 'Private Message';
    }
    $('#edit-room-type').html(roomType);

    // Modal subtitle
    var ownerText = '';
    if (editRoomChannel !== null && editRoomChannel.owner) {
      ownerText = 'Owned by @' + editRoomChannel.owner.username;
    }
    $('#edit-room-owner').html(ownerText);

    $('#edit-room-body').hide();
    if (editRoomChannel === null) {
      if (editRoomType === 'io.pnut.core.chat') {
        $('#edit-room-body').html('You can modify chat room permissions at any time.');
        $('#edit-room-body').show();
      } else if (editRoomType === 'io.pnut.core.pm') {
        $('#edit-room-body').html('Private message permissions cannot be changed.');
        $('#edit-room-body').show();
      }
    }

    // Set name field
    if (editRoomType === 'io.pnut.core.chat') {
      $('#edit-room-name').show();
    } else {
      $('#edit-room-name').hide();
    }

    $('#edit-room-text').val('');
    if (editRoomChannel === null && editRoomType === 'io.pnut.core.pm') {
      $('#edit-room-text').show();
    } else {
      $('#edit-room-text').hide();
    }

    $('#edit-room-perm').removeAttr('disabled');
    if (editRoomType === 'io.pnut.core.pm') {
      $('#edit-room-perm').attr('disabled', true);
      $('#edit-room-perm').val('private');
    } else if (editRoomChannel !== null && editRoomChannel.acl.write.any_user) {
      $('#edit-room-perm').val('public');
    } else if (editRoomChannel !== null &&
               (editRoomChannel.acl.read['public'] ||
                editRoomChannel.acl.read.any_user)) {
      $('#edit-room-perm').val('public-read');
    } else {
      $('#edit-room-perm').val('private');
    }

    if (settings.name) {
      $('#edit-room-name').val(settings.name);
    } else {
      $('#edit-room-name').val('');
    }

    if (settings.description) {
      $('#edit-room-promo-text').val(settings.description);
    } else {
      $('#edit-room-promo-text').val('');
    }

    if (settings.categories) {
      $('#edit-room-categories').val(settings.categories);
    }

    editRoomFields.reset();
    if (editRoomChannel !== null) {
      var keys = Object.keys(roomInfo.members);
      for (i = 0; i < keys.length; i += 1) {
        editRoomFields.addField('@' + keys[i]);
      }

      $('#edit-room-message-count').html('Messages created: ' + editRoomChannel.counts.messages);
    }
    if (canEdit) {
      editRoomFields.addField();
    }
    if (canEdit) {
      $('#edit-room-save').show();
      $('#edit-room-cancel').html('Cancel');
      $('#edit-room-deactivate').show();
      if (editRoomChannel !== null && editRoomChannel.acl.write.immutable) {
        $('#edit-room-perm').attr('disabled', true);
        editRoomFields.disable();
      } else {
        editRoomFields.enable();
      }
      if (editRoomChannel !== null && editRoomChannel.acl.read.immutable) {
        $('#edit-room-perm').attr('disabled', true);
      }
    } else {
      $('#edit-room-save').hide();
      $('#edit-room-deactivate').hide();
      $('#edit-room-cancel').html('Back');
      $('#edit-room-name').attr('disabled', true);
      $('#edit-room-perm').attr('disabled', true);
      editRoomFields.disable();
    }
    if (editRoomChannel === null) {
      $('#edit-room-save').html('Create');
      $('#edit-room-deactivate').hide();
    } else {
      $('#edit-room-save').html('Save');
    }
    $('#edit-room-error-div').html('');
    updatePatterPerm();
  };

  function completeEditRoom(names) {
    var settings = pnut.note.findPatterSettings(editRoomChannel);
    if (names && names.length === 0 &&
        editRoomType === 'io.pnut.core.pm') {
      util.flagError('pm-create-fields-error-div', 'You need at least one recipient');
    } else if (names) {
      if (editRoomType === 'io.pnut.core.pm') {
        createPmChannel(names);
      } else {
        if (editRoomChannel === null) {
          createPatterChannel(names);
        } else {
          changePatterChannel(editRoomChannel, names);
        }
      }
      $('#edit-room-modal').modal('hide');
    }
    enableEditRoom();
  }

  function disableEditRoom() {
    $('#edit-room-x').attr('disabled', true);
    $('#edit-room-name').attr('disabled', true);
    $('#edit-room-text').attr('disabled', true);
    $('#edit-room-perm').attr('disabled', true);
    $('#edit-room-cancel').attr('disabled', true);
    $('#edit-room-deactivate').attr('disabled', true);
    $('#edit-room-save').button('loading');
    editRoomFields.disable();
  }

  function enableEditRoom() {
    $('#edit-room-x').removeAttr('disabled');
    $('#edit-room-name').removeAttr('disabled');
    $('#edit-room-text').removeAttr('disabled');
    $('#edit-room-perm').removeAttr('disabled');
    $('#edit-room-cancel').removeAttr('disabled');
    $('#edit-room-deactivate').removeAttr('disabled');
    $('#edit-room-save').button('reset');
    editRoomFields.enable();
  }

  function getPatterAccess(perm, members, oldChannel)
  {
    var channel = { auto_subscribe: true, acl: { read:{}, write:{} } };
    if (! oldChannel || ! oldChannel.acl.write.immutable) {
      var canWrite = (perm === 'public');
      var writers = {
        immutable: false,
        any_user: canWrite
      };
      if (! canWrite)
      {
        writers.user_ids = members;
      }
      channel.acl.write = writers;
    }
    if (! oldChannel || ! oldChannel.acl.read.immutable) {
      var canRead = (perm === 'public' || perm === 'public-read');
      var readers = {
        immutable: false,
        'public': canRead,
        any_user: canRead
      };
      channel.acl.read = readers;
    }
    channel.acl.write.immutable = false;
    channel.acl.read.immutable = false;

    return channel;
  }

  function getPatterNotes(channel, name, promo)
  {
    var annotations = [];
    var settings = pnut.note.findPatterSettings(channel);
    var cats = $('#edit-room-categories').val();
    var settingsNote = {
      type: 'io.pnut.core.chat-settings',
      value: { name: name, description: promo, categories: cats }
    };
    annotations.push(settingsNote);
    var fallback = {
      type: 'io.pnut.core.fallback_url',
      value: {
        url: 'https://beta.pnut.io/messages/' + channel.id
      }
    };
    annotations.push(fallback);
    return annotations;
  }

  function updatePatterPerm() {
    var perm = $('#edit-room-perm');
    var label = $('#edit-room-perm-label');
    var pwrapper = $('#edit-room-promote-wrapper');
    var poptions = $('#edit-room-promo-options');
    var fields = editRoomFields;

    if (perm.val() === 'private' ||
        (editRoomChannel !== null &&
         ! editRoomModal.canEditChannel(editRoomChannel))) {
      pwrapper.hide();
    } else {
      pwrapper.show();
    }

    // if (pbox.attr('checked')) {
    //   poptions.show();
    // } else {
    //   poptions.hide();
    // }

    if (perm.val() === 'public') {
      fields.hide();
    } else {
      fields.show();
    }
    if (perm.val() === 'private') {
      label.html('This room is private and only accessible by its members.');
    } else if (perm.val() === 'public') {
      label.html('This room is public and anyone may join or view it.');
    } else if (perm.val() === 'public-read') {
      label.html('Only members may participate, but anyone may view this room.');
    }
  }

  function getPromo()
  {
    var promo = $('#edit-room-promo-text').val();
    return promo;
  }

  function changePatterChannel(oldChannel, names, callback) {
    if (names)
    {
      var success = $.proxy(roomInfo.completeChannelInfo, roomInfo);
      if (callback)
      {
        success = callback;
      }

      var channel = getPatterAccess($('#edit-room-perm').val(),
                                    names, oldChannel);

      channel.raw = getPatterNotes(oldChannel,
                                           $('#edit-room-name').val(),
                                           getPromo());
      pnut.api.updateChannel(oldChannel.id, channel, {include_channel_raw: 1},
                               success, null);
      $('#edit-room-modal').modal('hide');
    }
    enableEditRoom();
  }

  function createPmChannel(names)
  {
    var text = $('#edit-room-text').val();
    var message = { text: text,
                    destinations: names };
    pnut.api.createMessage('pm', message, { include_channel_raw: 1 },
                             completeCreatePm, failCreatePm);
  }

  function completeCreatePm(response)
  {
    util.redirect('/' + response.data.channel_id);
  }

  function failCreatePm(meta)
  {
    util.flagError('edit-room-error-div', 'Create PM Request Failed');
  }

  var completeBlurb = function (response)
  {
    changePatterChannel(this.channel, this.names, this.callback);
  };

  function createPatterChannel(names)
  {
    var context = {
      names: names
    };
    var access = $('#edit-room-perm').val();
    var channel = {
      type: 'io.pnut.core.chat'
    };
    if (access === 'public') {
      channel.acl = {write:{any_user:true},read:{public:true}};
    } else if (access === 'public-read') {
      channel.acl = {write:{any_user:false,user_ids:names},read:{any_user:true,public:false}};
    } else if (access === 'private') {
      channel.acl = {write:{any_user:false,user_ids:names},read:{public:false}};
    }
    channel.raw = getPatterNotes(channel,
                            $('#edit-room-name').val(),
                            getPromo());
    pnut.api.createChannel(channel, { include_channel_raw: 1 },
                            $.proxy(completeCreatePatter, context),
                            $.proxy(failCreatePatter, context));
  }

  var completeCreatePatter = function (response)
  {
    util.redirect('/' + response.data.id);
  };

  var failCreatePatter = function (meta)
  {
    util.flagError('edit-room-error-div', 'Create Room Request Failed');
  };

  function redirectToChannel(response)
  {
    util.redirect('/' + response.data.id);
  }

  function clickSave(event) {
    event.preventDefault();
    if ($('#edit-room-name').val() === '' &&
        editRoomType === 'io.pnut.core.chat') {
      util.flagError('edit-room-error-div', 'You must specify a room name');
    } else if ($('#edit-room-text').val() === '' &&
               editRoomType === 'io.pnut.core.pm') {
      util.flagError('edit-room-error-div', 'You must compose a message');
    } else {
      disableEditRoom();
      editRoomFields.checkNames(completeEditRoom);
    }
    return false;
  }

  function clickDeactivate(event) {
    event.preventDefault();
    var yes = window.confirm('Are you sure you want to deactivate this channel?');
    if (yes) {
      pnut.api.deleteChannel(editRoomChannel.id, {},
                            $.proxy(completeDeleteChannel, {}),
                            $.proxy(failDeleteChannel, {}));
    }
    return false;
  }

  var completeDeleteChannel = function (response)
  {
    util.redirect('/' + response.data.id);
  };

  var failDeleteChannel = function (meta)
  {
    util.flagError('edit-room-error-div', 'Deactivate Channel Request Failed');
  };

  return editRoomModal;
});
