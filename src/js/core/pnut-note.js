// pnut-note.js
//
// Functions to create and process pnut.io raw

/*global define: true */
define(['util'], function (util) {
  'use strict';

  var note = {};

  note.findAnnotation = function (type, list)
  {
    var result = null;
    var i = 0;
    if (list)
    {
      for (i = 0; i < list.length; i += 1)
      {
        if (list[i].type === type)
        {
          result = list[i].value;
          break;
        }
      }
    }
    return result;
  };

  note.findPatterSettings = function (channel)
  {
    var result = null;
    if (channel)
    {
      result = note.findAnnotation('io.pnut.core.chat-settings',
                                   channel.raw);
    }
    if (result === null)
    {
      result = {};
    }
    return result;
  };

  note.findPatterName = function (channel)
  {
    var name = null;
    var settings = note.findAnnotation('io.pnut.core.chat-settings',
                                       channel.raw);
    if (settings !== null && settings.name !== undefined)
    {
      name = settings.name;
    }
    return name;
  };

  note.findBlogName = function (channel)
  {
    var name = null;
    var settings = note.findAnnotation('net.blog-app.settings',
                                       channel.raw);
    if (settings !== null && settings.name !== undefined)
    {
      name = settings.name;
    }
    return name;
  };

  note.findBlogStatus = function (message)
  {
    return note.findAnnotation('net.blog-app.status',
                               message.raw);
  };

  note.findBlogPost = function (message)
  {
    return note.findAnnotation('nl.chimpnut.blog.post',
                               message.raw);
  };

  note.findBlogPhotoset = function (message)
  {
    return note.findAnnotation('net.blog-app.photoset',
                               message.raw);
  };

  note.findChannelRefId = function (message)
  {
    var id = null;
    if (message)
    {
      var ref = note.findAnnotation('net.view-app.channel-ref',
                                    message.raw);
      if (ref && ref.id)
      {
        id = ref.id;
      }
    }
    return id;
  };

  note.findCrosspost = function (message)
  {
    return note.findAnnotation('io.pnut.core.crosspost',
                               message.raw);
  };

  note.findBroadcast = function (message)
  {
    var ref = note.findAnnotation('net.patter-app.broadcast',
                               message.raw);
    if (ref && !ref.url) {
      ref.url = 'https://beta.pnut.io/posts/' + ref.id;
    }
    return ref;
  };

  note.broadcastNote = function (post_id, url) {
    return {
      type: 'net.patter-app.broadcast',
      value: {
        id: post_id,
        url: url
      }
    };
  };

  note.embedImageNote = function (url, widthIn, heightIn) {
    var width = widthIn;
    if (widthIn === null ||
        widthIn === undefined)
    {
      width = 300;
    }
    var height = heightIn;
    if (heightIn === null ||
        heightIn === undefined)
    {
      height = 300;
    }
    return {
      type: 'io.pnut.core.oembed',
      value: {
        version: '1.0',
        type: 'photo',
        width: width,
        height: height,
        url: util.stripSpaces(url)
      }
    };
  };

  note.channelRefNote = function (id, name, userId, type) {
    return {
      type: 'net.view-app.channel-ref',
      value: {
        id: id,
        label: name,
        owner_id: userId,
        type: type
      }
    };
  };

  return note;
});
