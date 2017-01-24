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
    return channel.acl.full.you &&
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
      roomType += 'Patter Room';
    } else if (editRoomType === 'io.pnut.core.pm') {
      roomType += 'PM Channel';
    }
    $('#edit-room-type').html(roomType);

    // Modal subtitle
    var ownerText = 'Unknown Owner';
    if (editRoomChannel !== null && editRoomChannel.owner)
    {
      ownerText = 'Owned by @' + editRoomChannel.owner.username;
    }
    $('#edit-room-owner').html(ownerText);

    $('#edit-room-body').hide();
    if (editRoomChannel === null) {
      if (editRoomType === 'io.pnut.core.chat') {
        $('#edit-room-body').html('Patter rooms may be public or private and the owner can modify permissions after they are created.');
        $('#edit-room-body').show();
      } else if (editRoomType === 'io.pnut.core.pm') {
        $('#edit-room-body').html('Private message channels are always private, and you cannot change their permissions.');
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
    } else if (editRoomChannel !== null &&
               (editRoomChannel.acl.write['public'] ||
                editRoomChannel.acl.write.any_user)) {
      $('#edit-room-perm').val('public');
    } else if (editRoomChannel !== null &&
               (editRoomChannel.acl.read['public'] ||
                editRoomChannel.acl.read.any_user)) {
      $('#edit-room-perm').val('public-read');
    } else {
      $('#edit-room-perm').val('private');
    }

    if (settings.name)
    {
      $('#edit-room-name').val(settings.name);
    }
    else
    {
      $('#edit-room-name').val('');
    }

    if (settings.description)
    {
      $('#edit-room-promo-text').val(settings.description);
      $('#edit-room-promote').attr('checked', 'checked');
    }
    else
    {
      $('#edit-room-promo-text').val('');
      $('#edit-room-promote').removeAttr('checked');
    }

    if (settings.categories)
    {
      for (i = 0; i < categories.length; i += 1)
      {
        $('#edit-' + categories[i]).removeAttr('checked');
      }

      for (i = 0; i < settings.categories.length; i += 1)
      {
        for (j = 0; j < categories.length; j += 1)
        {
          if (settings.categories[i] === categories[j])
          {
            $('#edit-' + categories[j]).attr('checked', 'checked');
          }
        }
      }
    }

    editRoomFields.reset();
    if (editRoomChannel !== null)
    {
      var keys = Object.keys(roomInfo.members);
      for (i = 0; i < keys.length; i += 1) {
        editRoomFields.addField('@' + keys[i]);
      }
    }
    if (canEdit) {
      editRoomFields.addField();
    }
    if (canEdit) {
      $('#edit-room-save').show();
      $('#edit-room-cancel').html('Cancel');
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
      $('#edit-room-cancel').html('Back');
      $('#edit-room-name').attr('disabled', true);
      $('#edit-room-perm').attr('disabled', true);
      editRoomFields.disable();
    }
    if (editRoomChannel === null)
    {
      $('#edit-room-save').html('Create');
    }
    else
    {
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
          if (getPromo() === '') {
            changePatterChannel(editRoomChannel, names);
          }
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
    $('#edit-room-save').button('loading');
    editRoomFields.disable();
  }

  function enableEditRoom() {
    $('#edit-room-x').removeAttr('disabled');
    $('#edit-room-name').removeAttr('disabled');
    $('#edit-room-text').removeAttr('disabled');
    $('#edit-room-perm').removeAttr('disabled');
    $('#edit-room-cancel').removeAttr('disabled');
    $('#edit-room-save').button('reset');
    editRoomFields.enable();
  }

  function getPatterAccess(perm, members, oldChannel)
  {
    var channel = { auto_subscribe: true };
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
        'public': canRead
      };
      channel.acl.read = readers;
    }

    return channel;
  }

  function getPatterNotes(channel, name, promo)
  {
    var annotations = [];
    var settings = pnut.note.findPatterSettings(channel);
    var cats = [];
    var i = 0;
    var settingsNote = {
      type: 'io.pnut.core.chat-settings',
      value: { name: name }
    };
    if (promo === '') {
      pnut.api.deleteMessage('1614',
                               null, null, null);
    }
    annotations.push(settingsNote);
    var fallback = {
      type: 'io.pnut.core.fallback_url',
      value: {
        url: 'http://patter.s3rv.com/room.html?channel=' + channel.id
      }
    };
    annotations.push(fallback);
    return annotations;
  }

  function updatePatterPerm() {
    var perm = $('#edit-room-perm');
    var label = $('#edit-room-perm-label');
    var pwrapper = $('#edit-room-promote-wrapper');
    var pbox = $('#edit-room-promote');
    var poptions = $('#edit-room-promo-options');
    var fields = editRoomFields;

    if (perm.val() === 'private' ||
        (editRoomChannel !== null &&
         ! editRoomModal.canEditChannel(editRoomChannel))) {
      pwrapper.hide();
    } else {
      pwrapper.show();
    }

    if (pbox.attr('checked')) {
      poptions.show();
    } else {
      poptions.hide();
    }

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
    var promo = '';
    if ($('#edit-room-promote').attr('checked'))
    {
      promo = $('#edit-room-promo-text').val();
    }
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
      channel.annotations = getPatterNotes(oldChannel,
                                           $('#edit-room-name').val(),
                                           getPromo());
      pnut.api.updateChannel(oldChannel.id, channel, {include_annotations: 1},
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
    pnut.api.createMessage('pm', message, { include_raw: 1 },
                             completeCreatePm, failCreatePm);
  }

  function completeCreatePm(response)
  {
    util.redirect('room.html?channel=' + response.data.channel_id);
  }

  function failCreatePm(meta)
  {
    util.flagError('edit-room-error-div', 'Create PM Request Failed');
  }

  var completeBlurb = function (response)
  {
    changePatterChannel(this.channel, this.names, response.data.id,
                        this.callback);
  };

  function createPatterChannel(names)
  {
    var context = {
      names: names
    };
    var channel = {
      type: 'io.pnut.core.chat'
    };
    pnut.api.createChannel(channel, { include_raw: 1 },
                             $.proxy(completeCreatePatter, context),
                             $.proxy(failCreatePatter, context));
  }

  var completeCreatePatter = function (response)
  {
    if (getPromo() === '') {
      changePatterChannel(response.data, this.names, null, redirectToChannel);
    }
  };

  var failCreatePatter = function (meta)
  {
    util.flagError('edit-room-error-div', 'Create Patter Room Request Failed');
  };

  function redirectToChannel(response)
  {
    util.redirect('room.html?channel=' + response.data.id);
  }

  function clickSave(event) {
    event.preventDefault();
    if ($('#edit-room-name').val() === '' &&
        editRoomType === 'io.pnut.core.chat') {
      util.flagError('edit-room-error-div', 'You must specify a name');
    } else if ($('#edit-room-text').val() === '' &&
               editRoomType === 'io.pnut.core.pm') {
      util.flagError('edit-room-error-div', 'You must compose a message');
    } else {
      disableEditRoom();
      editRoomFields.checkNames(completeEditRoom);
    }
    return false;
  }

  return editRoomModal;
});
