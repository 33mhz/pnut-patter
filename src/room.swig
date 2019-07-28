{% extends 'base.swig' %}
{% block title %}A chat client for Pnut{% endblock %}

{% block css %}
<script type='text/javascript'>
(function () {
  var styles = [
    '/css/normalize.css',
    '/css/style.css?d=2019-07-28'
  ];

  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var query_params = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    query_params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  // replace the default styles with your own
  if (query_params['replace_styles']) {
    styles = query_params['replace_styles'].split(',');
  }
  // Append styles to the default styles
  if (query_params['append_styles']) {
    styles.push(query_params['append_styles']);
  }

  for (var i = 0; i < styles.length; i++) {
    document.write('<link rel="stylesheet" type="text/css" href="' + styles[i] + '">');
  }

}())
</script>
{% endblock %}

{% block javascript %}
  <script>
    window.PATTER = window.PATTER || {};
    if (window !== window.top) {
      window.PATTER.embedded = true;
      window.PATTER.unique_id = Math.random().toString(36).slice(2);
    }
  </script>
  <script data-main="/js/core/room" src="/js/deps/require-jquery.js"></script>
{% endblock %}

{% block server %}
  {% if site_config.using_server %}
  <% if (name !== '') { %>
    <div class="modal fade" id="intro-modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title"><%- name %></h4>
          </div>
          <div class="modal-body">
            <p><%- blurb %></p>
          </div>
          <div class="modal-footer">
            <a href="archive.html?channel=<%- channelId %>" class="btn btn-default pull-left">Archive</a>
            <button type="button" class="btn btn-primary" data-dismiss="modal">Ok</button>
          </div>
        </div>
      </div>
    </div>
  <% } %>
  {% endif %}
{% endblock %}

{% block body %}
    <div class="modal fade" id="fail-modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Failed to Load Patter Room</h4>
          </div>
          <div class="modal-body">
            <p id="fail-body"></p>
          </div>
          <div class="modal-footer">
            <a href="/" class="btn btn-primary">Return to Lobby</a>
          </div>
        </div>
      </div>
    </div>

  <div id="container" style="display: none">
    <header class="menuBar">
      <a id="lobby_btn" class="header_btn" href="/"><i class="fa fa-home white-icon" title="Home"></i></a>
      <div id="logo"></div>
      <a id="room_btn" data-toggle="dropdown" data-target="#settings" class="header_btn"><i class="fa fa-cog white-icon" title="Settings"></i></a>
      <div id="settings" class="dropdown pull-right">
        <ul class="dropdown-menu" role="menu">
          <li role="presentation"><a role="menuitem" id="subscribe" href="#" data-toggle="dropdown" data-target="#settings">Subscribe</a></li>
          <li role="presentation"><a role="menuitem" id="view" href="#" data-toggle="dropdown" data-target="#settings">View Room</a></li>
          <li role="presentation"><a role="menuitem" id="archive" href="/archive.html" target="_blank" data-toggle="dropdown" data-target="#settings">Archive</a></li>
          <li role="presentation" class="divider"></li>
          <li role="presentation"><a role="menuitem" id="options-button" href="" data-toggle="dropdown" data-target="#settings">Options</a></li>
          <li role="presentation"><a role="menuitem" id="help" href="/faq.html" target="_blank" data-toggle="dropdown" data-target="#settings">Help</a></li>
        </ul>
      </div>
    </header>

    <section id="content">

      <div id="room_header">
        <h1 class="room_title"><span class="participants"></span></h1>
      </div>
      <div id="messages">
        <ul class="messageList">
        </ul>
        <div id="stickyMessages" style="display:none">
          <p id="stickyLink" class="stickyColor"><i class="fa fa-thumb-tack" aria-hidden="true"></i> Sticky Messages</p>
          <ul class="stickyMessageList" style="margin-top:0">
          </ul>
        </div>
      </div>

      <div id="users">
        <ul class="userList">
        </ul>
      </div>
    </section>
    <footer>
      <div id="chatInput">
        <form id="chat-form">
          <input type="text" id="chatBox" placeholder="Enter text here." maxlength="2000" autofocus="true">
        </form>
        <textarea id="textBox" placeholder="Enter text here." maxlength="2000" autofocus="true" style="display: none"></textarea>
        <a id="chatSend"><i class="fa fa-comment white-icon" title="Chat"></i></a>
        <a id="chatBroadcast"><i class="fa fa-globe white-icon" title="Broadcast to Global"></i></a>
        <a id="chatEmbed"><i class="fa fa-file white-icon" title="Attach File"></i></a>
      </div>
      <div class="must-authorize">
        <p>You must <a class="authorize-chat-button btn btn-primary">Authorize</a>
           Patter to chat.</p>
      </div>
      <div class="read-only">
        <p>This room is read-only. You can watch, but not chat.</p>
      </div>
    </footer>

  </div>

  <div id="modal-container"></div>
  <div id="options-wrapper"></div>
{% endblock %}

{% block bottom_js %}

{% endblock %}
