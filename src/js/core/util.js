// util.js
//
// General utility functions of use to any JavaScript project

/*global define:true */
define(['jquery', 'moment'],
function ($, moment)
{
  'use strict';

  var util = {};

  util.redirect = function (dest)
  {
    window.location = dest;
  };

  util.getUrlVars = function ()
  {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    var i = 0;
    for (i = 0; i < hashes.length; i += 1)
    {
      hash = hashes[i].split('#');
      hash = hash[0].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  };

  util.getHashParams = function () {
    var hashParams = {};
    var e,
    a = /\+/g,  // Regex for replacing addition symbol with a space
    r = /([^&;=]+)=?([^&;]*)/g,
    d = function (s) { return decodeURIComponent(s.replace(a, ' ')); },
    q = window.location.hash.substring(1),
    b = true;

    /*jshint -W084 */
    while (e = r.exec(q)) {
      hashParams[d(e[1])] = d(e[2]);
    }


    return hashParams;
  };

  util.widgetParams = function () {
    return {
      width: '300px',
      height: '42px',
      type: 'authorize'
    };
  };

  util.urlParams = function (state) {
    var clientId = window.PATTER.config.client_id;
    var pos = window.location.href.indexOf('#');
    var uri = window.location.href;
    if (pos >= 0)
    {
      uri = window.location.href.substr(0, pos);
    }

    var params = {
      client_id: clientId,
      response_type: 'token',
      redirect_uri: uri,
      scope: ['messages', 'write_post'].join(' ')
    };

    if (state) {
      params.state = state;
    }

    return params;
  };

  util.makeAuthorizeUrl = function (state) {
    var params = util.urlParams(state);

    console.log(params);
    return 'https://pnut.io/oauth/authenticate?' + $.param(params);
  };

  util.initAuthBody = function (options) {
    $('#auth-body').show();
    var authUrl = util.makeAuthorizeUrl(options.state);
    $('.authorize-button').attr('href', authUrl);
    $('.authorize-button').addClass('adn-button');
    $('#authorize-menu').attr('title', authUrl);
    $('#authorize-menu').click(function (event) {
      window.location.href = authUrl;
      return false;
    });

    var widget_params = util.widgetParams();
    var auth_params = util.urlParams();
    var button_params = {};
    $.map($.extend(widget_params, auth_params), function (val, key) {
      key = key.replace(/_/g, '-');
      $('.authorize-button').attr('data-' + key, val);
    });

    window.ADN.replaceButtons();
    $('.authorize-button').css('visibility', 'visible');
  };

  util.htmlEncode = function (value)
  {
    var result = '';
    if (value) {
      result = $('<div />').text(value).html();
    }
    return result;
  };

  util.htmlDecode = function (value)
  {
    var result = '';
    if (value) {
      result = $('<div />').html(value).text();
    }
    return result;
  };


  util.stripSpaces = function (str)
  {
    return str.replace(/ +$/g, '').replace(/^ +/g, '');
  };

  util.flagError = function (id, message)
  {
    var newAlert = '<div class="alert alert-error">' +
          '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
          '<strong>Error:</strong> ' + message +
          '</div>';
    $('#' + id).html(newAlert);
  };

  util.formatTimestamp = function (list) {
    list.each(function (index, node) {
      if (node.title)
      {
        node.innerHTML = (moment(node.title).fromNow(true));
      }
    });
/*
    node.easydate({
      locale: {
        'future_format': '%s&nbsp;%t',
        'past_format': '%t&nbsp;%s',
        'second': 's',
        'seconds': 's',
        'minute': 'm',
        'minutes': 'm',
        'hour': 'h',
        'hours': 'h',
        'day': 'day',
        'days': 'days',
        'week': 'week',
        'weeks': 'weeks',
        'month': 'month',
        'months': 'months',
        'year': 'year',
        'years': 'years',
        'yesterday': 'yesterday',
        'tomorrow': 'tomorrow',
        'now': 'now',
        'ago': '&nbsp;',
        'in': 'in'
      },
      live: false
    });
*/
  };

  util.has_focus = true;
  $(window).on('focus', function () {
    util.has_focus = true;
  });
  $(window).on('blur', function () {
    util.has_focus = false;
  });

  return util;
});
