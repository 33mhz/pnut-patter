// roomInfo.js
//
// Information about the current room the user is chatting in.

/*global define:true */
define(['jquery', 'util', 'pnut'], function ($, util, pnut) {
  'use strict';

  var roomInfo = {
    id: null,
    channel: null,
    members: {},
    changeCallback: null
  };

  roomInfo.updateChannel = function ()
  {
//    $('#loading-message').html("Fetching Channel Information");
    pnut.api.getChannel(this.id, {include_channel_raw: 1},
                          $.proxy(this.completeChannelInfo, this),
                          $.proxy(failChannelInfo, this));
  };

  roomInfo.completeChannelInfo = function (response)
  {
    var owner = response.data.owner;
    var keyList = Object.keys(this.members);
    var i = 0;
    this.channel = response.data;
    var name = pnut.note.findPatterName(this.channel);
    if (name)
    {
      $('title').html(util.htmlEncode(name) + ' (Patter)');
    }
    else
    {
      $('title').html('Private Message (Patter)');
    }
    for (i = 0; i < keyList.length; i += 1)
    {
      delete this.members[keyList[i].toString().toLowerCase()];
    }
    if (owner)
    {
      this.members[owner.username.toString().toLowerCase()] = owner;
    }
    if (pnut.isLogged() && roomInfo.channel.acl.write.user_ids.length > 0)
    {
      getWriterInfo();
    }
    else if (this.changeCallback)
    {
      this.changeCallback();
    }
  };

  var failChannelInfo = function (meta)
  {
    if (this.changeCallback)
    {
      this.changeCallback();
    }
  };

  function getWriterInfo()
  {
    // bandaid. Should instead be able to manage different ACLs. At least concat adds the full-access to the list, so updates won't revoke their access
    var ids = roomInfo.channel.acl.write.user_ids.concat(roomInfo.channel.acl.full.user_ids);
    if (ids)
    {
      pnut.api.getUserList(ids, null, completeWriterInfo, failWriterInfo);
    }
    else if (roomInfo.changecallback)
    {
      roomInfo.changeCallback();
    }
  }

  function completeWriterInfo(response)
  {
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      roomInfo.members[response.data[i].username.toString().toLowerCase()] = response.data[i];
    }

    if (roomInfo.changeCallback)
    {
      roomInfo.changeCallback();
    }
  }

  function failWriterInfo(response)
  {
    if (roomInfo.changeCallback)
    {
      roomInfo.changeCallback();
    }
  }

  return roomInfo;
});
