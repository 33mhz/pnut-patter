// options.js
//
// Combined handler and storage for all options passed to the app
// either as a query string, in a hash, or as part of localStorage

define([],
function () {
  'use strict';

  var options = {
    // channel -- Channel id if this is a single room view
    channel: null,
    // token -- Access token if available
    token: null,
    // embedded -- True if this is an embedded view
    embedded: false,
    // unique_id -- Unique per-instance id
    unique_id: null,
    // client_id -- Per-client id set by grunt
    client_id: null,
    // state -- state for authorization
    state: null,
    // noStorage -- True if we do not have access to local storage
    noStorage: false,
    // settings -- Object containing user settings
    settings: {}
  };

  options.initialize = function ()
  {
    // Initialize query options
    var query = getUrlVars();
    if (query.channel)
    {
      options.channel = query.channel;
    }
    options.state = query.state;

    // Initialize token option from hashtag or localStorage
    var hash = getHashParams();
    if (hash.access_token)
    {
      options.token = hash.access_token;
      window.location.hash = '';
//      window.location = window.location.href.substr(0, window.location.href.indexOf('#'));
      try
      {
        localStorage.patter2Token = options.token;
      }
      catch (e)
      {
        options.noStorage = true;
      }
    }
    else
    {
      try
      {
        if (localStorage.patter2Token)
        {
          options.token = localStorage.patter2Token;
        }
      }
      catch (e)
      {
        options.noStorage = true;
      }
    }

    // Initialize options set from the PATTER variable
    if (window.PATTER)
    {
      options.embedded = window.PATTER.embedded;
      options.unique_id = window.PATTER.unique_id;
      if (window.PATTER.config)
      {
        options.client_id = window.PATTER.config.client_id;
      }
    }

    try
    {
      options.settings = JSON.parse(localStorage.patterSettings);
    }
    catch (e) { }
    if (! options.settings)
    {
      options.settings = {};
    }
  };

  options.saveSettings = function ()
  {
    try
    {
      localStorage.patterSettings = JSON.stringify(options.settings);
    }
    catch (e) { }
  };

  function getUrlVars()
  {
    if (window.location.href.indexOf('?') !== -1) {
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
    } else {
      var vars = [];
      var hashes = window.location.href.split('/');
      if (typeof hashes[3] !== 'undefined' && hashes[3] == 'room' && typeof hashes[4] !== 'undefined') {
        vars.push('channel');
        vars.channel = hashes[4];
      }
    }
    return vars;
  }

  function getHashParams()
  {
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
  }

  return options;
});
