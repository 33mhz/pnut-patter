// base.js
//
// Utility functions for dealing with pnut.io

/*global define:true */
define(['jquery', 'util', 'pnut-api', 'pnut-note'],
function ($, util, api, note) {
  'use strict';

  var pnut = {
    api: api,
    note: note,
    user: null
  };

  pnut.init = function (tokenCookie, urlCookie)
  {
    this.api.init(tokenCookie, urlCookie);
  };

  pnut.authorize = function ()
  {
    this.api.authorize();
  };

  pnut.logout = function ()
  {
    this.api.logout();
  };

  pnut.isLogged = function () {
    return this.api.accessToken !== null && this.api.accessToken !== undefined;
  };

  var updateUserSuccess = function (response) {
    pnut.user = response.data;
    if (this.success)
    {
      this.success(response);
    }
  };

  var updateUserFailure = function (meta)
  {
    if (this.failure)
    {
      this.failure(meta);
    }
  };

  pnut.updateUser = function (success, failure)
  {
    var complete = {
      success: success,
      failure: failure
    };
    api.getUser('me', { 'include_raw': 1 },
                   $.proxy(updateUserSuccess, complete),
                   $.proxy(updateUserFailure, complete));
  };


  pnut.htmlToHtml = function (content)
  {
    var result = content.html;
    var index;
    for (index = content.entities.mentions.length-1; index >= 0; index=index-1) {
      var mention = content.entities.mentions[index].text;
      result = result.replace(new RegExp('<span data-mention-id=\"[0-9]+?\" data-mention-name=\"'+mention+'\" itemprop=\"mention\">@'+mention+'</span>', 'ig'), '<a href="https://pnut.io/@'+mention+'" target="_blank" class="mention">@'+mention+'</a>');
    }
    for (index = content.entities.tags.length-1; index >= 0; index=index-1) {
      var tag = content.entities.tags[index].text;
      result = result.replace(new RegExp('<span data-tag-name=\"'+tag+'\" itemprop=\"tag\">#'+tag+'</span>', 'ig'), '<a href="https://pnut.io/tags/'+tag+'" target="_blank" class="hashtag">#'+tag+'</a>');
    }
    return result;
  };

  pnut.textToHtml = function (text, entitiesIn)
  {
    var result = $('<div/>');
    var entities = sortEntities(entitiesIn);
    var anchor = 0;
    var entity, link;
    var i = 0;
    for (i = 0; i < entities.length; i += 1) {
      entity = entities[i].entity;
      result.append(util.htmlEncode(text.substr(anchor, entity.pos - anchor)));
      link = $('<a target="_blank"/>');
      if (entities[i].type === 'mentions')
      {
        link.addClass('mention');
        link.attr('href',
                  'https://pnut.io/@' + util.htmlEncode(entity.text));
        link.append(util.htmlEncode('@' + entity.text));
      }
      else if (entities[i].type === 'tags')
      {
        link.addClass('hashtag');
        link.attr('href',
                  'https://pnut.io/tags/' +
                  util.htmlEncode(entity.text));
        link.append(util.htmlEncode('#' + entity.text));
      }
      else if (entities[i].type === 'links')
      {
        link.addClass('link');
        link.attr('href', entity.link);
        link.append(util.htmlEncode(entity.text));
      }
      result.append(link);
      anchor = entity.pos + entity.len;
    }
    result.append(util.htmlEncode(text.substr(anchor)));
    return result;
  };

  function sortEntities(entities)
  {
    var result = [];
    var typeList = ['mentions', 'tags', 'links'];
    var i = 0;
    var j = 0;
    for (i = 0; i < typeList.length; i += 1)
    {
      var type = typeList[i];
      for (j = 0; j < entities[type].length; j += 1)
      {
        result.push({pos: entities[type][j].pos,
                     type: type,
                     entity: entities[type][j]});
      }
    }
    result.sort(function (left, right) {
      return left.pos - right.pos;
    });
    return result;
  }

  pnut.renderStatus = function (channel)
  {
    var locked = (channel.acl.read.immutable && channel.acl.write.immutable);
    var lockStatus = '';
    if (locked) {
      lockStatus = '<i class="icon-lock"></i> ';
    }
    var status = '<span class="label">' + lockStatus + 'Private</span>';
    if (channel.acl.read['public'] || channel.acl.read.any_user) {
      status = '<span class="label label-success">' + lockStatus +
        'Public Read</span>';
    }
    if (channel.acl.write.any_user) {
      status = '<span class="label label-success">' + lockStatus +
        'Public</span>';
    }
    return status;
  };

  return pnut;
});
