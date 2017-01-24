/*
 * room.js
 *
 * Handler for /room.html endpoint
 *
 */

var config = require('./config');

var fs = require('q-io/fs');
var pnut = require(config.pnutPath);
var _ = require('underscore');

function execute(request, response)
{
  fs.read(__dirname + '/../dist/room.html').then(function (roomFile) {
    try {
    fetchRoom(request, response, _.template(roomFile));
    } catch (e) { console.log(e); }
  });
}

function fetchRoom(request, response, roomTemplate)
{
  response.setHeader('Content-Type', 'text/html');
  var channelId = request.query['channel'];
  if (! channelId)
  {
    skipServer(request, response, roomTemplate)();
  }
  else
  {
    pnut.authorize(null, config.token);
    var promise = pnut.channel.get(channelId, {include_raw: 1});
    promise.then(function (buffer) {
      try {
        buffer = JSON.parse(buffer.toString());
        var settings = pnut.note.find('io.pnut.core.chat-settings',
                                      buffer.data.raw);
        if (buffer.data.acl.read['public'] && settings)
        {
          var blurb = '';
          if (settings.description)
          {
            blurb = settings.description;
          }
          var data = {
            name: settings.name,
            blurb: blurb,
            channelId: channelId
          };
          var body = roomTemplate(data);
          response.setHeader('Content-Length', body.length);
          response.end(body);
        }
        else
        {
          skipServer(request, response, roomTemplate)();
        }
      } catch (e) { console.log(e); }
    }, skipServer(request, response, roomTemplate));
  }
}

function skipServer(request, response, roomTemplate)
{
  var handler = function (error)
  {
    var body = roomTemplate({ name: '', blurb: '', channelId: '' });
    response.setHeader('Content-Length', body.length);
    response.end(body);
  };
  return handler;
}

exports.execute = execute;
