// lobby.js
//
// Overall task for managing a list of subscribed channels

/*global require: true */
require(['jquery', 'pnut', 'util', 'js/options', 'js/core/editRoomModal',
         'js/core/OptionsModel', 'js/core/OptionsView',
         'js/core/RoomList', 'js/core/RoomListView',
         'js/core/allChannels', 'js/core/allUsers',
         'js/deps/text!template/public-tab.html',
         'bootstrap', 'jquery-cloud', 'jquery-pnut'],
function ($, pnut, util, options, editRoomModal,
          OptionsModel, OptionsView,
          RoomList, RoomListView,
          allChannels, allUsers, publicTabString) {
  'use strict';

  var tagCloud = [
    {text:'fun',weight:183},
    {text:'lifestyle',weight:147},
    {text:'profession',weight:90},
    {text:'language',weight:104},
    {text:'community',weight:218},
    {text:'tech',weight:201},
    {text:'event',weight:58},
    {text:'general',weight:40}
  ];

  var checkWait = 30 * 1000;

  var currentUser = null;

  var optionsModel;
  var optionsView;

  function initialize()
  {
    options.initialize();
    if (options.token)
    {
      pnut.api.accessToken = options.token;
      $.pnut.authorize(options.token);
      initLobby();
      $('#retry-button').on('click', function (event) {
        event.preventDefault();
        $('#error-home').hide();
        $('#loading-home').show();
        initLobby();
      });
      $('.logout').on('click', logout);
      $('#options-button').on('click', clickOptions);
      optionsModel = new OptionsModel();
      optionsView = new OptionsView({ model: optionsModel,
                                      el: $('#options-wrapper') });
    }
    else
    {
      util.initAuthBody(options);
      $('#main-body').hide();
    }
    $('#public').html(publicTabString);
  }

  function initLobby()
  {
    var promise = $.pnut.user.get('me');
    promise.then(function (response) {
      currentUser = response.data;
      $('#username').html(util.htmlEncode('@' + currentUser.username));
      pollUpdate();
    }, function (error) {
      $('#loading-home').hide();
      $('#error-message').html('You may have a bad connection or need to log back in.');
      $('#error-home').show();
    });
  }


  function initButtons() {
    editRoomModal.init();
    $('#compose-room').on('click', function (event) {
      event.preventDefault();
      editRoomModal.update(null, 'io.pnut.core.chat');
      editRoomModal.show();
    });
    $('#compose-pm').on('click', clickPm);
    $('#lookup-pm').on('click', clickPm);
    $('#new-send-pm').on('click', clickPm);
    $('#new-find-rooms').on('click', function (event) {
      event.preventDefault();
      $('#public-tab-link').tab('show');
      initTags();
    });
  }

  function clickPm(event) {
    event.preventDefault();
    editRoomModal.update(null, 'io.pnut.core.pm');
    editRoomModal.show();
  }

  var channelMembers = {};

  var unread = new RoomList({
    users: channelMembers
  });

  var rooms = new RoomList({
    users: channelMembers
  });

  var pms = new RoomList({
    users: channelMembers
  });

  var searches = new RoomList({
    users: channelMembers
  });

  function completeInitialize() {
    initButtons();
    var unreadView = new RoomListView({
      model: unread,
      el: $('#main-home'),
      tabEl: $('#home-tab'),
      showUnreadState: true,
      hideWhenRead: true,
      showMore: false,
      noneText: 'No unread subscriptions'
    });
    unread.reset(unread.subscriptionMethod, {}, '');
    unread.set({ hasMore: false });

    var roomView = new RoomListView({
      model: rooms,
      el: $('#rooms-content'),
      tabEl: $('#room-tab'),
      showUnreadState: true,
      showMore: true,
      noneText: 'No subscribed rooms'
    });
    rooms.reset(rooms.subscriptionMethod,
                { channel_types: 'io.pnut.core.chat' }, '');

    var pmView = new RoomListView({
      model: pms,
      el: $('#pms'),
      tabEl: $('#pm-tab'),
      showUnreadState: true,
      showMore: true,
      noneText: 'No private messages'
    });
    pms.reset(rooms.subscriptionMethod,
              { channel_types: 'io.pnut.core.pm' }, '');

    var searchView = new RoomListView({
      model: searches,
      el: $('#search'),
      showWhenUnsubscribed: true,
      showMore: true,
      noneText: 'No Rooms Found'
    });
    searches.reset(rooms.recentlyCreatedMethod, {}, '');

    $('#room-tab').show();
    $('#pm-tab').show();
    $('#public-tab').show();


    $('#home-tab').click(hideSearch);
    $('#room-tab').click(hideSearch);
    $('#pm-tab').click(hideSearch);
    $('#public-tab').click(initTags);
    $('#home-tab').click(updateUnread);
    $('#room-tab').click(updateRooms);
    $('#pm-tab').click(updatePms);

    $('#search-rooms').submit(clickSearch);
    $('#recent-rooms').click(clickRecent);
    $('#active-rooms').click(clickActive);

    $('#private-search-rooms').submit(clickPrivateSearch);
    $('#public-search-rooms').submit(clickPublicSearch);
    $('#public-active-rooms').click(clickPublicActive);
    $('#popular-rooms').click(clickPopular);
  }

  var tagsAreSetup = false;
  function initTags(event)
  {
    hideSearch();
    if (! tagsAreSetup)
    {
      var i = 0;
      for (i = 0; i < tagCloud.length; i += 1)
      {
        tagCloud[i].handlers = {
          click: makeHandler( tagCloud[i].text)
        };
        tagCloud[i].link = '#';
      }

      $('#tag-cloud').jQCloud(tagCloud, { removeOverflowing: false });
      tagsAreSetup = true;
    }
  }

  function makeHandler (text)
  {
    return function (event) {
      if (event)
      {
        event.preventDefault();
      }
      clickKeyword(text);
      return false;
    };
  }

  function hideSearch()
  {
    $('#search-tab').hide();
  }

  function updateUnread()
  {
    unread.processUpdates();
  }

  function updateRooms()
  {
    rooms.processUpdates();
  }

  function updatePms()
  {
    pms.processUpdates();
  }

  function clickSearch(event)
  {
    event.preventDefault();
    var text = $('#search-text');
    searchFor(text.val());
    text.val('');
  }

  function searchFor(text)
  {
    searches.reset(searches.searchMethod, { q: text },
                   'Search Results for "' + text + '"');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  function clickKeyword(text)
  {
    searches.reset(searches.searchChannelMethod, { categories: text },
                   'Chat Rooms in Category: "' + text + '"');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  function clickRecent(event)
  {
    event.preventDefault();
    searches.reset(searches.searchChannelMethod,
                   { q: '',
                     include_recent_message: 1,
                     is_public: 1,
                     order: 'id' },
                   'Recently Created Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
    //searches.reset(searches.recentlyCreatedMethod, {},
    //               'Recently Created Rooms');
  }

  function clickActive(event)
  {
    event.preventDefault();
    searches.reset(searches.activeMethod, {},
                   'Active Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  function clickPrivateSearch(event)
  {
    event.preventDefault();
    var text = $('#private-search-text');
    searches.reset(searches.searchChannelMethod,
                   { q: text.val(),
                     channel_types: 'io.pnut.core.chat',
                     is_private: 1 },
                   'Searching Your Private Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
    text.val('');
  }

  function clickPublicSearch(event)
  {
    event.preventDefault();
    var text = $('#public-search-text');
    searches.reset(searches.searchChannelMethod,
                   { q: text.val(),
                     is_public: 1,
                     include_recent_message: 1 },
                   'Searching All Public Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
    text.val('');
  }

  function clickPublicActive(event)
  {
    event.preventDefault();
    searches.reset(searches.searchChannelMethod,
                   { q: '',
                     is_public: 1,
                     include_recent_message: 1,
                     order: 'activity' },
                   'All Public Active Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  function clickPopular(event)
  {
    event.preventDefault();
    searches.reset(searches.searchChannelMethod,
                   { q: '',
                     is_public: 1,
                     include_recent_message: 1,
                     order: 'popularity' },
                   'All Public Popular Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  var updateSince = null;
  var updateTimer;
  var updatePoll = true;
  var hasUpdated = false;

  function pollUpdate()
  {
    clearTimeout(updateTimer);
    if (updatePoll)
    {
      updateTimer = setTimeout(pollUpdate, checkWait);
    }
    update();
  }

  function update()
  {
    util.formatTimestamp($('.timestamp'));
    var params = {
      include_channel_raw: 1,
      include_recent_message: 1,
      channel_types: 'io.pnut.core.pm,io.pnut.core.chat'
    };
    if (updateSince)
    {
      // params.since_id = updateSince;
      // params.count = -20;
      params.include_read = 0;
    }

    var promise = $.pnut.channel.getUserSubscribed(params);
    promise.then(function (response) {
      if (response.meta.max_id)
      {
        updateSince = response.meta.max_id;
      }
      return allUsers.fetchNewUsers(response.data).then(function () {
        processUpdate(response.data, response.meta.min_id);
      });
    }).then(function () {
      var used = {};
      var channels = [];
      pms.getUnreadIdList(channels, used);
      rooms.getUnreadIdList(channels, used);
      if (channels.length > 0) {
        return $.pnut.all.getChannelList(channels,
                                         { include_channel_raw: 1,
                                           include_recent_message: 1 });
      } else {
        return [];
      }
    }).then(function (response) {
      return allUsers.fetchNewUsers(response.data).then(function () {
        processUpdate(response.data);
      });
    });
  }

  function processUpdate(updates, minId)
  {
    if (! hasUpdated)
    {
      completeInitialize();
      $('#loading-home').hide();
      if (updates.length === 0)
      {
        $('#fallback-home').show();
      }
      else
      {
        $('#main-home').show();
      }
    }
    var pmUpdates = [];
    var roomUpdates = [];
    var unreadUpdates = [];
    var i = 0;
    for (i = updates.length - 1; i >= 0; i -= 1)
    {
      var channel = updates[i];
      var room = allChannels.add(channel);
      if (channel.type === 'io.pnut.core.pm')
      {
        pmUpdates.push(room);
      }
      else if (channel.type === 'io.pnut.core.chat')
      {
        roomUpdates.push(room);
      }

      if (channel.has_unread)
      {
        unreadUpdates.push(room);
      }
    }
    pms.addUpdates(pmUpdates, minId);
    rooms.addUpdates(roomUpdates, minId);
    unread.addUpdates(unreadUpdates, null);
    if (! hasUpdated)
    {
      unread.processUpdates();
      hasUpdated = true;
    }
  }

  function logout(event)
  {
    event.preventDefault();
    delete localStorage.patter2Token;
    util.redirect('/');
    return false;
  }

  function clickOptions(event)
  {
    event.preventDefault();
    optionsView.show();
  }

  $(document).ready(initialize);
});

