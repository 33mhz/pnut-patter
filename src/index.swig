{% extends 'base.swig' %}

{% block css %}
  <link rel="stylesheet" style="text/css" href="/css/jqcloud.css">
  <link rel="stylesheet" style="text/css" href="/css/lobby.css">
{% endblock %}

{% block javascript %}
<script data-main="/js/core/lobby" src="/js/deps/require-jquery.js"></script>
{% endblock %}
{% block body  %}
    <header class="menuBar">
      <a id="lobby_btn" class="header_btn" href="/" data-toggle="dropdown" data-target="#compose"><i class="fa fa-plus white-icon" title="New"></i></a>

      <div id="logo"></div>

      <a id="room_btn" data-toggle="dropdown" data-target="#settings" class="header_btn"><i class="fa fa-gear white-icon" title="Settings"></i></a>

      <div id="compose" class="dropdown">
        <ul class="dropdown-menu" role="menu" style="left:0;right:auto">
          <li role="presentation"><a role="menuitem" id="compose-pm" href="#" data-toggle="dropdown" data-target="#compose">Send Private Message</a></li>
          <!--<li role="presentation"><a role="menuitem" id="lookup-pm" href="#" data-toggle="dropdown" data-target="#compose">Lookup Private Message</a></li>-->
          <li role="presentation"><a role="menuitem" id="compose-room" href="#" data-toggle="dropdown" data-target="#compose">Create Room</a></li>
        </ul>
      </div>


      <div id="settings" class="dropdown pull-right">
        <ul class="dropdown-menu" role="menu">
          <li role="presentation" class="dropdown-header" id="username">No User</li>
          <li role="presentation" class="divider"></li>
          <li role="presentation"><a role="menuitem" href="" id="options-button">Options</a></li>
          <li role="presentation"><a role="menuitem" href="faq.html">FAQ</a></li>
          <li role="presentation" class="divider"></li>
          <li role="presentation"><a role="menuitem" class="logout" href="#" data-toggle="dropdown" data-target="#settings">Logout</a></li>
        </ul>
      </div>
    </header>

  <div class="container" id="main-body">

    <div id="main-lobby">

<br><br><br>

      <div class="tabbable tabs-left">
        <ul class="nav nav-tabs">
          <li id="home-tab" class="active" title="Unread"><a href="#home" data-toggle="tab">Unread</a></li>
          <li id="pm-tab" style="display: none" title="Private Messages"><a id="pm-tab-link" href="#pms" data-toggle="tab"><span class="hideLess767">Private Messages</span><span class="hideGreater767">PM</span> <span class="badge" style="display: none" id="unread"></span></a></li>
          <li id="room-tab" style="display: none" title="Rooms I am subscribed to"><a id="room-tab-link" href="#rooms" data-toggle="tab"><span class="hideLess767">My </span>Rooms <span class="badge" style="display: none" id="unread"></span></a></li>
          <li id="public-tab" style="display: none" title="Public Rooms"><a id="public-tab-link" href="#public" data-toggle="tab">Public<span class="hideLess767"> Rooms</span></a></li>
          <li id="search-tab" style="display: none" title="Search"><a id="search-tab-link" href="#search" data-toggle="tab">Search</a></li>
        </ul>
        <div class="tab-content">
          <div id="home" class="tab-pane active">
            <div class="row">
              <div class="col-md-12">
                <div id="fallback-home" style="display: none">
                  <h1>Welcome to Patter</h1>
                  <p>With Patter, you can chat privately with friends or join public chat rooms. There are several ways to get started:</p>
                  <div class="row well well-small">
                  <div class="col-md-3"><button id="new-find-rooms" class="btn btn-primary">Find Public Rooms</button></div><div class="col-md-9"> Find a public room about a topic you are interested in.</div>
                  </div>
                  <br>
                  <div class="row well well-small">
                  <div class="col-md-3"><button id="new-send-pm" class="btn btn-primary">Private Message</button></div><div class="col-md-9"> If you already have friends here, send them a message.</div>
                  </div>
                  <br>
                  <div class="row well well-small">
                  <div class="col-md-3"><a href="https://patter.chat/585" class="btn btn-primary">Welcome to Patter</a></div><div class="col-md-9"> If you have questions about how to use Patter or suggestions for how to make it better, come say hi.</div>
                  </div>
                </div>
                <div id="loading-home">
                  <div class="text-center">
                    <h4>Loading...</h4>
                    <!--<img src="images/spinner-big.gif" width="32" height="32"
                         alt="Loading...">-->
                    <i class="fa fa-cog fa-spin fa-3x fa-fw"></i>
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
                <div id="error-home" style="display: none">
                  <div class="text-center">
                    <h4>Failed to Load</h4>
                    <p id="error-message"></p>
                    <p><button id="retry-button" class="btn btn-default">Retry</button> or <button class="logout btn btn-default">Logout</button></p>
                  </div>
                </div>
                <div id="main-home" style="display: none"></div>
              </div>
            </div>

      <br>
      <div class="well well-small">
        <p>For troubleshooting, contact <a href="https://pnut.io/@33MHz">@33MHz</a>. In-room design by <a href="https://twitter.com/zenimpulse">@zenimpulse</a>. Patter for iOS was created by <a href="https://pnut.io/@boxenjim">@boxenjim</a>. The Patter logo was created by <a href="https://pnut.io/@tellingtales">@tellingtales</a>.</p>
      </div>

          </div>
          <div id="rooms" class="tab-pane">
            <br>
            <form role="form" class="form-inline" id="private-search-rooms">
              <div class="form-group" style="display: inline-block">
                <label class="sr-only" for="private-search-text">Search Your Private Rooms by Title</label>
                <input type="text" class="form-control" id="private-search-text" placeholder="Search by Title & Description">
              </div>
              <button type="submit" class="btn btn-default"><i class="fa fa-search" aria-hidden="true"></i></button>
            </form>
            <div id="rooms-content"></div>
          </div>
          <div id="pms" class="tab-pane"></div>
          <div id="public" class="tab-pane"></div>
          <div id="search" class="tab-pane"></div>
        </div>
      </div>

    </div>

    <div id="modal-container"></div>
    <div id="options-wrapper"></div>
{% endblock %}

{% block bottom_js %}

{% endblock %}
