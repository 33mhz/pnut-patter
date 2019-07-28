// ChatForm.js
//
// A form used for submitting messages to a Patter chat room.

/*global define:true */
define(['jquery', 'util', 'pnut', 'js/core/attachModal',
        'js/deps/text!template/ChatForm.html',
        'jquery-caret'],
function ($, util, pnut, attachModal, chatTemplate) {
  'use strict';

  function ChatForm(root, channel, postCallback)
  {
    this.root = root;
    this.channelId = channel.id;
    this.channelName = pnut.note.findPatterName(channel);
    this.postCallback = postCallback;

    root.find('#chat-form').submit($.proxy(clickSend, this));
    root.find('#chatSend').click($.proxy(clickSend, this));
    if (channel.type === 'io.pnut.core.chat' &&
        (channel.acl.read['public'] || channel.acl.read.any_user))
    {
      root.find('#chatBroadcast').click($.proxy(clickBroadcast, this));
    }
    else
    {
      root.find('#chatBroadcast').hide();
    }
    root.find('#chatEmbed').click($.proxy(clickAttach, this));
    root.find('#chatEmbed').hide();
    $('.authorize-chat-button').attr('href', util.makeAuthorizeUrl(window.PATTER.unique_id));
    $('#chatInput').hide();
    $('.must-authorize').hide();
    $('.read-only').hide();
    if (! pnut.isLogged())
    {
      $('.must-authorize').show();
      if (window.PATTER.embedded) {
        // if the user is an embededd room we have to launch the authorization dialog flow
        $('.authorize-chat-button').on('click', function () {
          var params = {
            state: window.PATTER.unique_id
          };
          window.open('/auth.html?' + $.param(params), 'patter_auth', 'width=720,height=600,status=0,navigation=0,scrollbars=1');

          window.AUTH_DONE = function (access_token) {
            window.location = window.location.href + '#access_token=' + access_token;
            window.location.reload();
          };

          return false;
        });
      }

    }
    else if (! channel.acl.write.you)
    {
      $('.read-only').show();
    }
    else
    {
      $('#chatInput').show();
    }
    attachModal.init();
  }

  var clickSend = function (event)
  {
    event.preventDefault();
    if (this.getInput().val().length > 0)
    {
      var text = this.getInput().val();
      this.postMessage(text, getImageUrl(text));
      this.getInput().val('');
    }
    return false;
  };

  var clickBroadcast = function (event)
  {
    event.preventDefault();
    if (this.getInput().val().length > 0)
    {
      var text = this.getInput().val();
      this.getEntities(text, getImageUrl(text));
      this.getInput().val('');
    }
    return false;
  };

  var clickAttach = function (event)
  {
    event.preventDefault();
    attachModal.show();
    return false;
  };

  ChatForm.prototype.postMessage = function (messageString, raw, links)
  {
    var post = {
      text: messageString,
      raw: raw
    };
    if (links !== undefined)
    {
      post.entities = { links: links };
    } else {
      post.entities = {
        parse_markdown_links: 1,
        parse_links: 1
      };
    }
    pnut.api.createMessage(this.channelId, post, { include_message_raw: 1 },
                             $.proxy(completePostMessage, this),
                             $.proxy(failPostMessage, this));
  };

  var completePostMessage = function (response)
  {
    this.postCallback([response.data]);
  };

  var failPostMessage = function (response)
  {
  };

  ChatForm.prototype.getEntities = function (messageString, raw)
  {
    var context = {
      message: messageString,
      raw: raw,
      chat: this
    };
    pnut.api.processText({ text: messageString }, {},
                           $.proxy(broadcastMessage, context),
                           failBroadcastMessage);
  };

  var broadcastMessage = function (response)
  {
    var postAnnotations = this.raw.slice(0);
    var url = 'https://beta.pnut.io/messages/' + this.chat.channelId;
    postAnnotations.push({
      type: 'io.pnut.core.crosspost',
      value: {
        canonical_url: url
      }
    });
    postAnnotations.push({
      type: 'io.pnut.core.channel.invite',
      value: {
        channel_id: this.chat.channelId
      }
    });
    var post = {
      text: this.message,
      raw: postAnnotations
    };
    var text = this.message;
    var promo = '\n\n[' + this.chat.channelName + '](' + url + ')';
    if (text.length + promo.length <= 256)
    {
      post.text = text + promo;
    }
    var context = {
      message: this.message,
      raw: this.raw,
      chat: this.chat
    };
    pnut.api.createPost(post, {},
                        $.proxy(completeBroadcastMessage, context),
                        $.proxy(failBroadcastMessage, context));
  };

  var completeBroadcastMessage = function (response)
  {
    if (response.data)
    {
      var messageAnn = this.raw.slice(0);
      var broadcast = pnut.note.broadcastNote(response.data.id,
                                              'https://posts.pnut.io/' + response.data.id);
      messageAnn.push(broadcast);
      this.chat.postMessage(this.message, messageAnn);
    }
  };

  var failBroadcastMessage = function (response)
  {
  };

  ChatForm.prototype.getInput = function ()
  {
    var result = this.root.find('#chatBox');
    if (result.is(':hidden'))
    {
      result = this.root.find('#textBox');
    }
    return result;
  };

  ChatForm.prototype.insertUserIntoText = function (event)
  {
    event.preventDefault();
    if (pnut.isLogged())
    {
      var user = event.target.id;
      insertText(user, this.getInput());
    }
    return false;
  };

  function insertText(user, textBox)
  {
    var cursor = textBox.caret().start;
    var text = textBox.val();
    var before = text.substring(0, cursor);
    var after = text.substring(cursor);
    textBox.focus();
    textBox.val(before + user + ' ' + after);
    textBox.caret(cursor + user.length + 1, cursor + user.length + 1);
  }


  function getImageUrl(text) {
    var result = [];
    var match = urlRegex.exec(text);
    if (match !== null) {
      var url = match[0];
      var foundIndex = url.length - 4;
      if (url.indexOf('.jpg') === foundIndex ||
          url.indexOf('.png') === foundIndex ||
          url.indexOf('.gif') === foundIndex) {
        result.push(pnut.note.embedImageNote(url, 200, 200));
      }
    }
    return result;
  }

  // This whole thing pulled from
  // https://github.com/nooodle/noodleapp/blob/master/lib/markdown-to-entities.js
  //
  // Regex pulled from https://github.com/chriso/node-validator and
  // country codes pulled from
  // http://data.iana.org/TLD/tlds-alpha-by-domain.txt

  var urlRegex = /((?:http|https|ftp|scp|sftp):\/\/)?(?:\w+:\w+@)?(?:localhost|(?:(?:[\-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|AC|AD|AE|AF|AG|AI|AL|AM|AN|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CW|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|ST|SU|SV|SX|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW))|(?:(?:\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(?:\.(?:\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[\-\w~!$+|.,="'\(\)_\*:]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[\-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?/ig;

  return ChatForm;
});
