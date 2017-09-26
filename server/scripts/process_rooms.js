var ARGV = require('optimist').argv;
var fs = require('fs');
var config = require('../config.js');
var pnut = require('../' + config.pnutPath);

function execute()
{
  'use strict';

  initBlacklist();

  pnut.authorize(config.patter_token);

  var promise = pnut.all.getUserPosts('me', { include_deleted: 0, include_post_raw: 1 });
  promise.then(function (buffer) {
    processUser(buffer);
    return pnut.all.getMessages('1614', { include_deleted: 0, include_message_raw: 1 });
  }).then(function (buffer) {
    var channels = getChannels(buffer);
    return pnut.all.getChannelList(channels, { include_channel_raw: 1 });
  }).then(function (buffer) {
    processChannels(buffer);
    checkPosts();
    updatePosts();
  }).fail(function (response) {
    console.log('failure to get messages', response.status);
  });
}

var blacklist = {};
var channelToPost = {};
var allPosts = [];
var channelMap = {};

var newPosts = [];
var deadPosts = [];

var newChannels = [];
var deadChannels = [];

var tags = {};

function initBlacklist()
{
  if (ARGV.blacklist)
  {
    var text = fs.readFileSync(ARGV.blacklist, {encoding: 'utf8'});
    if (text)
    {
      var lines = text.split('\n');
      var i = 0;
      for (i = 0; i < lines.length; i += 1)
      {
        blacklist[lines[i]] = 1;
      }
    }
  }
}

function processUser(response)
{
  console.log('processUser');
  var i = 0;
  for (i = 0; i < response.data.length; i += 1)
  {
    var post = response.data[i];
    var invite = findNote('io.pnut.core.channel.invite', post);
    if (invite)
    {
      channelToPost[invite.channel_id] = {
        post: post.id,
        text: post.text
      };
      allPosts.push(invite.channel_id);
    }
    else
    {
      if (! ARGV.fake)
      {
        deadPosts.push(post.id);
      }
      else
      {
        console.log('Not deleting: ' + post.text);
      }
    }
  }
}

function getChannels(response)
{
  console.log('getChannels');
  var channels = [];
  var i = 0;
  for (i = 0; i < response.data.length; i += 1)
  {
    var message = response.data[i];
    var invite = findNote('io.pnut.core.channel.invite', message);
    if (invite)
    {
      channels.push(invite.channel_id);
    }
    else
    {
      var ref = findNote('net.view-app.channel-ref', message);
      if (ref)
      {
        channels.push(ref.id);
      }
    }
  }
  return channels;
}

function processChannels(response)
{
  console.log('processChannels');
  var i = 0;
  for (i = 0; i < response.data.length; i += 1)
  {
    var channel = response.data[i];
    var settings = findNote('io.pnut.core.chat-settings', channel);
    if (settings && settings.description &&
        channel.acl.read['public'] && ! blacklist[channel.id])
    {
      if (! channel.you_subscribed)
      {
        if (! ARGV.fake)
        {
          newChannels.push(channel.id);
        }
        else
        {
          console.log("Not subscribing [" + channel.id + "]: " + settings.description);
        }
      }
      var fullText = settings.name + ': ';
      if (settings.categories)
      {
        fullText += '(' + settings.categories.join(' ') + ') ';
        addTags(settings.categories);
      }
      if (settings.description)
      {
        fullText += settings.description;
      }
      var text = fullText.substr(0, 256);
      var post = channelToPost[channel.id];
      if (! post || post.text !== text)
      {
        if (! ARGV.fake)
        {
          newPosts.push({text: text, channel: channel.id});
          if (post)
          {
            deadPosts.push(post.post);
          }
        }
        else
        {
          console.log("Not Creating [" + channel.id + "]: " + text);
        }
      }
      channelMap[channel.id] = 1;
    }
    else if (channel.you_subscribed)
    {
      if (! ARGV.fake)
      {
        deadChannels.push(channel.id);
      }
      else
      {
        console.log("Not unsubscribing: " + channel.id);
      }
    }
  }
}

function checkPosts()
{
  console.log('checkPosts');
  var i = 0;
  for (i = 0; i < allPosts.length; i += 1)
  {
    var channelId = allPosts[i];
    if (! channelMap[channelId])
    {
      deadPosts.push(channelToPost[channelId].post);
    }
  }
}

function updatePosts()
{
  var promise;
  if (deadPosts.length > 0)
  {
    var dead = deadPosts.pop();
    console.log('Deleting post ' + dead);
    promise = pnut.post.destroy(dead);
    promise.then(updatePosts);
  }
  else if (newPosts.length > 0)
  {
    var arg = newPosts.pop();
    var post = {
      text: arg.text,
      raw: [{
        type: 'io.pnut.core.channel.invite',
        value: {
          'channel_id': arg.channel
        },
      },{
        type: 'io.pnut.core.crosspost',
        value: {
          'canonical_url': 'https://patter.chat/room/' + arg.channel
        }
      }]
    };
    console.log('Creating post: ' + arg.text);
    promise = pnut.post.create(post);
    promise.then(function (response) {
      console.log('Success');
    }, function (response) {
      console.log('Failure to create post: ' + response.status);
    });
    addCount -= 1;
    if (addCount > 0)
    {
      promise.then(updatePosts);
    }
  }
  else if (newChannels.length > 0)
  {
    console.log('subscribing to channel ' + newChannels[newChannels.length - 1]);
    promise = pnut.channel.subscribe(newChannels.pop());
    promise.then(updatePosts);
  }
  else if (deadChannels.length > 0)
  {
    console.log('unsubscribing from channel ' + deadChannels[deadChannels.length - 1]);
    promise = pnut.channel.unsubscribe(deadChannels.pop());
    promise.then(updatePosts);
  }
  else
  {
    fs.writeFileSync('tags.json', JSON.stringify(getTagArray()));
  }
}

var addCount = 5;

function addTags(tagList)
{
  if (tagList)
  {
    var i = 0;
    for (i = 0; i < tagList.length; i += 1)
    {
      var pattern = new RegExp('^[0-9a-zA-Z_]+$');
      if (pattern.test(tagList[i]))
      {
        if (tags[tagList[i]])
        {
          tags[tagList[i]] += 1;
        }
        else
        {
          tags[tagList[i]] = 1;
        }
      }
    }
  }
}

function getTagArray()
{
  var result = [];
  for (var key in tags)
  {
    if (tags.hasOwnProperty(key))
    {
      result.push({
        text: key,
        weight: tags[key]
      });
    }
  }
  return result;
}

function findNote(name, message)
{
  var result = null;
  var i = 0;
  for (i = 0; i < message.raw.length; i += 1)
  {
    if (message.raw[i].type === name)
    {
      result = message.raw[i].value;
      break;
    }
  }
  return result;
}

execute();
