// ChatHistory.js
//
// A pane showing a scrollable list of chats and posts

/*global define:true */
define(['jquery', 'underscore', 'util', 'js/options', 'pnut',
        'js/deps/text!template/post.html', 'js/deps/text!template/postEmoji.html',
        'jquery-titlealert'],
function ($, _, util, options, pnut, postString, emojiTemplate) {
  'use strict';

  var postTemplate = _.template(postString);
  var bloop;

  // id is the DOM id of the node to add the history too.
  function ChatHistory(channel, root, authorCallback, muteCallback, avatarUrls, deleteCallback, stickyCallback)
  {
    this.channel = channel;
    this.root = root;
    this.shownPosts = {};
    this.authorCallback = authorCallback;
    this.muteCallback = muteCallback;
    this.deleteCallback = deleteCallback;
    this.stickyCallback = stickyCallback;
    this.avatarUrls = avatarUrls;
    this.atBottom = true;
    this.root.scroll($.proxy(onScroll, this));
    $(window).on('resize', $.proxy(this.scrollToBottom, this));
    updateTimestamps();
    bloop = new Audio('/audio/bloop.mp3');
  }

  ChatHistory.prototype.update = function (data, goBack, stickyMessages)
  {
    var allPosts = $('<ul/>');
    var last = null;
    var i = 0;
    var messages_in_series = 0;
    for (i = data.length - 1; i > -1; i -= 1)
    {
      if (stickyMessages)
      {
        this.root.find('.stickyMessageList').append(this.renderPost(data[i]));
      }
      else if (this.validPost(data[i]))
      {
        // show avatar if new user or over 5 messages since last change
        data[i].is_serial = last !== null && messages_in_series < 5 && last.user_id === data[i].user.id;
        if (data[i].is_serial) {
          messages_in_series = messages_in_series +1;
        } else {
          messages_in_series = 0;
        }
        var post = this.renderPost(data[i]);
        allPosts.append(post);
        last = {
          user_id: data[i].user.id,
          username: '@' + data[i].user.username,
          text: util.htmlEncode(data[i].content.text),
          mentions: data[i].content.entities.mentions || []
        };
        this.shownPosts[data[i].id] = 1;
      }
    }
    if (last !== null)
    {
      this.addPostsToFeed(allPosts.contents(), goBack, last);
    }
  };

  ChatHistory.prototype.validPost = function (data)
  {
    if (typeof data.is_deleted !== 'undefined')
    {
      return false;
    }
    else if (this.shownPosts.hasOwnProperty(data.id))
    {
      return false;
    }
    return true;
  };

  var onScroll = function (event)
  {
    var bottom = this.root.prop('scrollHeight') - this.root.height();
    this.atBottom = (this.root.scrollTop() >= bottom);
  };

  ChatHistory.prototype.renderPost = function (data)
  {
    var body = pnut.htmlToHtml(data.content);
    var name = '';
    if (data.user) {
      name = data.user.username;
    }
    var avatarUrl = null;
    if (this.avatarUrls[data.user.username]) {
      avatarUrl = this.avatarUrls[data.user.username];
    }
    var broadcast = pnut.note.findAnnotation('net.patter-app.broadcast', data.raw);
    var crosspost = pnut.note.findCrosspost(data.raw);
    var params = {
      body: body,
      name: name,
      avatarUrl: avatarUrl,
      is_sticky: data.is_sticky,
      id: data.id,
      source: data.source,
      can_delete: (pnut.user && (pnut.user.id === data.user.id || (this.channel.type === 'io.pnut.core.chat' && ((this.channel.owner && pnut.user.id === this.channel.owner.id) || this.channel.acl.full.user_ids.indexOf(pnut.user.id) !== -1)))),
      can_mute: (pnut.user && pnut.user.id !== data.user.id),
      can_sticky: (pnut.user && (this.channel.type === 'io.pnut.core.pm' || ((this.channel.owner && pnut.user.id === this.channel.owner.id) || this.channel.acl.full.user_ids.indexOf(pnut.user.id) !== -1))),
      broadcast: broadcast,
      crosspost: crosspost,
      is_serial: data.is_serial
    };
    var post = $(postTemplate(params));

    renderEmbedImage(data, post);

    // updates all message timestamps
    var timestamp = $('.postTimestamp', post);
    timestamp.attr('title', data.created_at);
    util.formatTimestamp(timestamp);

    // add a couple styles
    if (broadcast) {
      post.addClass('broadcasted');
    }
    if (this.checkMention(data.user.id, data.content.entities.mentions)) {
      post.addClass('mentioned');
    }

    // click handlers
    var author = post.find('.author');
    author.attr('id', '@' + data.user.username);
    author.on('click', this.authorCallback);

    var deleter = post.find('.deleteButton');
    var that = this;
    deleter.click(function (event) {
      event.preventDefault();

      var yes = window.confirm('Are you sure you want to delete this message?');
      if (yes) {
        that.deleteCallback(data.id);
      }
      return false;
    });

    var stick = post.find('.stickyButton');
    stick.click(function (event) {
      event.preventDefault();
      that.stickyCallback(data.id + ',1');
      return false;
    });

    var unstick = post.find('.unstickyButton');
    unstick.click(function (event) {
      event.preventDefault();
      that.stickyCallback(data.id + ',0');
      return false;
    });

    var mute = post.find('.muteButton');
    var username = data.user.username;
    mute.click(function (event) {
      event.preventDefault();
      that.muteCallback(username);
      return false;
    });

    return post;
  };

  function renderEmbedImage(data, post) {
    var hasFound = false;
    var wrapper = post.find('.embedImageWrapper');
    var notes = data.raw;
    var i = 0;
    for (i = 0; i < notes.length; i += 1) {
      if (notes[i].type === 'io.pnut.core.oembed') {
        var embed = notes[i].value;
        if (embed !== null && embed.type === 'photo') {
          var link = $('<a target="_blank"></a>');
          var url = embed.url;
          var width = '300px';
          var height = '300px';
          if (embed.thumbnail_url) {
            url = embed.thumbnail_url;
          }
          link.css('background-image', 'url("' + embed.url + '")');
          link.css('background-position', 'center');
          link.css('background-size', 'contain');
          link.css('background-repeat', 'no-repeat');
          link.css('width', width);
          link.css('height', height);
          link.css('display', 'block');
          link.css('margin-left', 'auto');
          link.css('margin-right', 'auto');
          link.attr('href', embed.url);
          wrapper.append(link);
          hasFound = true;
        }
      }
    }
    if (! hasFound) {
      wrapper.remove();
    }
  }

  ChatHistory.prototype.checkMention = function (sender_id, mentions)
  {
    var result = false;
    if (pnut.user !== null && pnut.user.id !== sender_id)
    {
      var i = 0;
      for (i = mentions.length - 1; i > -1; i -= 1) {
        if (mentions[i].id === pnut.user.id) {
          result = true;
        }
      }
    }
    return result;
  };

  ChatHistory.prototype.addPostsToFeed = function (posts, addBefore, last)
  {
    var fromBottom = this.root.prop('scrollHeight') - this.root.scrollTop();
    if (addBefore)
    {
      this.root.find('.messageList').prepend(posts);
    }
    else
    {
      this.root.find('.messageList').append(posts);
      if (! util.has_focus) {
        var isMention = this.checkMention(last.user_id, last.mentions);
        if (options.settings.everyTitle ||
            (isMention && options.settings.mentionTitle))
        {
          $.titleAlert('New Message', {
            duration: 10000,
            interval: 1000
          });
        }
        if (options.settings.everyNotify ||
            (isMention && options.settings.mentionNotify))
        {
          if ('Notification' in window)
          {
            var notification = new window.Notification(last.username, {body: last.text, icon: '/images/logo.png'});
          }
          if (window.fluid)
          {
            window.fluid.showGrowlNotification({
              title: last.username,
              description: last.text,
              icon: '/images/logo.png',
              sticky: false
            });
          }
        }
        if (options.settings.everySound ||
            (isMention && options.settings.mentionSound))
        {
          bloop.play();
        }
      }
    }
    if (this.atBottom)
    {
      this.scrollToBottom();
    }
    else
    {
      scrollTo(this.root, fromBottom);
    }
  };

  function scrollTo(root, fromBottom)
  {
    var newBottom = root.prop('scrollHeight') - fromBottom;
    root.scrollTop(newBottom);
    var scrollDown = function ()
    {
      newBottom = root.prop('scrollHeight') - fromBottom;
      root.scrollTop(newBottom);
    };
    setTimeout(scrollDown, 0);
  }

  ChatHistory.prototype.checkBottom = function ()
  {
    if (this.atBottom)
    {
      this.scrollToBottom();
    }
  };

  ChatHistory.prototype.scrollToBottom = function (event)
  {
    if (event)
    {
      event.preventDefault();
    }
    scrollTo(this.root, 0);
    this.atBottom = true;
    return false;
  };

  var timestampTimer = null;

  function updateTimestamps()
  {
    clearTimeout(timestampTimer);
    util.formatTimestamp($('.postTimestamp'));
    timestampTimer = setTimeout(updateTimestamps, 60 * 1000);
  }

  function makeUserColor(user) {
    /*jslint bitwise: true*/
    var hash = getHash(user);
    var color = (hash & 0x007f7f7f).toString(16);
    while (color.length < 6) {
      color = '0' + color;
    }
    return '#' + color;
  }

  function getHash(str) {
    /*jslint bitwise: true*/
    var hash = 0;
    if (str.length === 0)
    {
      return hash;
    }
    var i = 0;
    for (i = 0; i < str.length; i += 1) {
      var chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  return ChatHistory;
});
