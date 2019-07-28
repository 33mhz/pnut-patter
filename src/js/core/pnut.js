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
