// RoomFeed.js
//
// Fetches latest messages from room channel periodically and uses a
// PatterEmbed to display them.

/*global define:true */
define(['jquery', 'util', 'pnut', 'js/core/PatterEmbed'],
function ($, util, pnut, PatterEmbed) {
  'use strict';

  function RoomFeed(channel, members, formRoot, userRoot, historyRoot)
  {
    this.embed = new PatterEmbed(channel, members, formRoot, userRoot, historyRoot,
                                 $.proxy(this.update, this),
                                 $.proxy(this.mute, this),
                                 $.proxy(this.deleteMessage, this));
    this.channel = channel;
    this.goBack = false;
    this.timer = null;
    this.earliest = null;
    this.latest = null;
    this.shownFeed = false;
    this.more = true;
    this.markerName = null;

    pnut.api.getStickyMessages(this.channel.id, {include_message_raw: 1},
                                $.proxy(completeStickyFeed, this),
                                $.proxy(failFeed, this));
  }

  RoomFeed.prototype.checkFeed = function ()
  {
    clearTimeout(this.timer);
    //    $('#loading-message').html("Fetching Messages From Channel");

    // Should the feed load older messages or newer ones.
    var scroll = this.embed.history.root.scrollTop();
    var height = this.embed.history.root.prop('scrollHeight');
    this.goBack = this.shownFeed && this.more && (scroll <= height / 3);
//    this.goBack = false;

    var options = {
      include_message_raw: 1,
      count: 100
    };

    if (! this.shownFeed) {
      options.count = 40;
    }
    if (this.goBack && this.earliest !== null) {
      options.before_id = this.earliest;
    }
    if (!this.goBack && this.latest !== null) {
      options.since_id = this.latest;
    }
    pnut.api.getMessages(this.channel.id, options,
                           $.proxy(completeFeed, this),
                           $.proxy(failFeed, this));

    this.timer = setTimeout($.proxy(this.checkFeed, this), 20000);
  };

  var completeFeed = function (response)
  {
    clearTimeout(this.timer);
    if (this.goBack && ! response.meta.more) {
      this.more = false;
    }
    if (response.meta.min_id !== undefined) {
      if (this.earliest === null || response.meta.min_id < this.earliest) {
        this.earliest = response.meta.min_id;
      }
    }
    if (response.meta.max_id !== undefined) {
      if (this.latest === null || response.meta.max_id > this.latest) {
        this.latest = response.meta.max_id;
      }
    }

    this.update(response.data, response.meta.marker, response.meta.max_id);

    if (! this.shownFeed) {
      this.shownFeed = true;
    }
    this.embed.history.checkBottom();
    var time = 2000;
    if (! util.has_focus) {
      time = 10000;
    }

    this.timer = setTimeout($.proxy(this.checkFeed, this), time);
  };

  var completeStickyFeed = function (response)
  {
    if (response.data.length > 0) {
      this.embed.addPosts(response.data, false, true);

      // show individual 
      if (typeof localStorage['hiddenStickyIds_' + this.channel.id] !== 'undefined') {
        var hiddenStickyIds = JSON.parse(localStorage['hiddenStickyIds_' + this.channel.id]);

        var allHidden = true;
        var i = 0;
        for (i = response.data.length - 1; i > -1; i -= 1) {
          if (hiddenStickyIds.indexOf(response.data[i].id) !== -1) {
            // hide dismissed ID
            $('#stickyMessages .msg' + response.data[i].id).hide();
          } else {
            allHidden = false;
          }
        }

        // hide list if all are hidden (for toggle)
        if (allHidden) {
          $('.stickyMessageList').hide();
          $('#stickyLink').removeClass('stickyColor');
        }
      }

      $('#stickyLink').click({channel_id: this.channel.id}, function(event) {
        if ($('.stickyMessageList').is(':visible')) {
          // add newly hidden to list
          var hidden = [];
          try {
            hidden = JSON.parse(localStorage['hiddenStickyIds_' + event.data.channel_id]);
          } catch (e) { }

          var n = 0;
          var visible = $('#stickyMessages li:visible');
          for (n = visible.length -1; n > -1; n -= 1) {
            hidden.push(visible[n].dataset.messageId);
          }
          localStorage['hiddenStickyIds_' + event.data.channel_id] = JSON.stringify(hidden);
          // hide block
          $('.stickyMessageList').hide('fast');
          $('#stickyLink').removeClass('stickyColor');
        } else {
          // show all
          $('.stickyMessageList li').show();
          $('.stickyMessageList').show('fast');
          delete localStorage['hiddenStickyIds_' + event.data.channel_id];
        }
      });

      // show tab if any exist
      $('#stickyMessages').show();
    }
  };



  RoomFeed.prototype.update = function (posts, marker, inMaxId)
  {
    var maxId = inMaxId;
    if (! maxId)
    {
      if (posts.length > 0)
      {
        maxId = posts[0].id;
      }
    }

    this.embed.addPosts(posts, this.goBack);

    if (marker)
    {
      this.markerName = marker.name;
    }
    if (maxId && this.markerName &&
        (! marker || ! marker.id ||
         parseInt(maxId, 10) > parseInt(marker.id, 10)))
    {
      changeMarker(this.markerName, maxId);
    }
  };

  var failFeed = function (meta)
  {
  };

  function changeMarker(markerName, id)
  {
    if (markerName !== null && id !== null)
    {
      var marker = [{
        id: id,
        name: markerName
      }];
      pnut.api.updateMarker(marker, null, null, null);
    }
  }

  RoomFeed.prototype.mute = function (userId)
  {
  };

  RoomFeed.prototype.deleteMessage = function (messageId, complete, failure)
  {
    var context = {
      messageId: messageId,
      complete: complete,
      failure: failure
    };
    pnut.api.deleteMessage(this.channel.id, messageId, {},
                            $.proxy(completeDelete, context),
                            $.proxy(failDelete, context));
  };

  var completeDelete = function (response)
  {
    // this.complete(this.messageId);
    $('.msg' + this.messageId).hide('slow', function(){ this.remove(); });
  };

  var failDelete = function (meta)
  {
    console.log('Failed to delete message ' + this.messageId);
    // this.failure(this.messageId, meta);
  };

  // RoomFeed.prototype.stickyMessage = function (messageId, complete, failure)
  // {
  //   var pieces = messageId.split(',');
  //   messageId = pieces[0];
  //   var is_sticky = pieces[1];

  //   var context = {
  //     messageId: messageId,
  //     complete: complete,
  //     failure: failure
  //   };

  // };

  return RoomFeed;
});
