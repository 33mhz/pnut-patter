/*
 * recent.js
 *
 * Handler for stream of recently active channels
 *
 */

var config = require('./config');
var pnut = require(config.pnutPath);

var cached = {};
var staleTime = 1000 * 60;

function execute(request, response)
{
  var stale = new Date().getTime() - staleTime;
  var id = request.query.before_id;
  if (! id)
  {
    id = '';
  }
  var current = cached[id];
  if (current && current.time > stale)
  {
    printResponse(response, current.text);
  }
  else
  {
    pnut.authorize(config.patter_token, null);
    var params = {
      include_raw: 1,
      include_recent_message: 1,
      before_id: id
    };
    var promise = pnut.channel.getUserSubscribed(params);
    promise.then(function (buffer) {
      cached[id] = {
        text: buffer.toString(),
        cachedTime: new Date().getTime()
      };
      printResponse(response, cached[id].text);
    }, function (error) {
      cached = null;
      printResponse(response, '{"meta":{ "code": 404 }, "data": {}}');
    });
  }
}

function printResponse(response, body)
{
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Content-Length', body.length);
  response.end(body);
}

exports.execute = execute;

