// PatterEmbed.js
//
// An embeddable version of Patter. It provides handlers for chat
// history, chat input, and a user list. It is up to the caller to feed
// it new messages and a channel to post in.

/*global define:true */
define(['jquery', './ChatForm', './UserList', './ChatHistory'],
function ($, ChatForm, UserList, ChatHistory) {
  'use strict';

  function PatterEmbed(channel, members,
                       formRoot, userRoot, historyRoot,
                       postCallback, muteCallback, deleteCallback, stickyCallback, unstickyCallback)
  {
    this.form = new ChatForm(formRoot, channel, postCallback);
    var insertCallback = $.proxy(this.form.insertUserIntoText, this.form);
    this.user = new UserList(userRoot, insertCallback);
    this.history = new ChatHistory(channel, historyRoot, insertCallback, muteCallback,
                                  this.user.avatars, deleteCallback, stickyCallback, unstickyCallback);
    this.user.updateChannel(channel, members);
  }

  PatterEmbed.prototype.addPosts = function (posts, goBack, stickyMessages)
  {
    if (!stickyMessages) {
      this.user.updatePosts(posts);
    }
    this.history.update(posts, goBack, stickyMessages);
  };

  return PatterEmbed;
});
