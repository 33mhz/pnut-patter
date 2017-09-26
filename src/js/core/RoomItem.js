// RoomItem.js
//
// Model for a single room in a list

/*global define:true */
define(['jquery', 'underscore', 'backbone', 'jquery-pnut'],
function ($, _, Backbone)
{
  'use strict';

  var RoomItem = Backbone.Model.extend({

    defaults: {
      channel: null
    },

    cleanup: function (root) {
      this.trigger('cleanup');
    },

    toggleSubscribe: function () {
      if (this.get('channel').you_subscribed)
      {
        this.performAction($.pnut.channel.unsubscribe, 'unsubscribe');
      }
      else
      {
        this.performAction($.pnut.channel.subscribe, 'subscribe');
      }
    },

    toggleMute: function () {
      if (this.get('channel').you_muted)
      {
        this.performAction($.pnut.channel.unmute, 'unmute');
      }
      else
      {
        this.performAction($.pnut.channel.mute, 'mute');
      }
    },

    performAction: function (f, name) {
      this.trigger('actionBegin');
      var id = this.get('channel').id;
      var options = {
        include_channel_raw: 1,
        include_recent_message: 1
      };
      var that = this;
      var promise = f(id, options);
      promise.then(function (response) {
        that.set({ channel: response.data });
      }, function (error) {
        that.trigger('actionFail', name);
      });
    }

  });

  return RoomItem;
});
