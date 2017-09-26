<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Patter - A chat client for pnut.io</title>

    <link rel="shortcut icon" href="/favicon.ico"/>
    {% block css %}
    {% endblock %}
    <link rel="stylesheet" style="text/css" href="/css/bootstrap/readable.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <script src="/js/core/config.js"></script>
    {% block javascript %}
    {% endblock %}
  </head>
  <body>
    {% block faq_header %}
    {% endblock %}
    {% block server %}
    {% endblock %}

    <div class="container" id="auth-body" style="display: none">

      <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand patter-logo" href="/"><img src="images/patter-logo-alt.png" width="70" height="15"></a>
        </div>
        <div class="collapse navbar-collapse navbar-ex1-collapse">
          <ul class="nav navbar-nav navbar-right">
            <li><a href="faq.html">FAQ</a></li>
            <li><button type="button" class="btn btn-primary navbar-btn"
                        id="authorize-menu"
                        style="margin-top: 8px; margin-right: 8px;">Login or Signup</button></li>
          </ul>
        </div>
      </nav>
      <br><br><br>



      <div class="panel panel-default">
        <div class="panel-heading text-center">
          <h1>What is Patter?</h1>
          <img src="images/chat-fig.png" alt="Patter is for chatting" width="687" height="408">
        </div>
        <div class="panel-body text-center">
          <p>Patter lets you <b>chat</b> with others</p>
          <p><b>Public rooms</b> let you find those with similar interests</p>
          <p>Use <b>private rooms</b> to connect with your friends</p>
          <p>Patter supports both <b>real-time</b> chat and occasional messages</p>
        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading text-center">
          <h1>Privacy and Control</h1>
          <img src="images/lock-fig.png" alt="You are in control with Patter" width="280" height="347">
        </div>
        <div class="panel-body text-center">
          <p>Patter is built on <a href="https://pnut.io">pnut.io</a>.</p>
          <p>Your Patter messages are stored only on pnut.io: <b>you decide</b> who can read them.</p>
          <p>Your messages are kept for as long as you want them.</p>
          <p>If you delete your account, your messages are deleted as well.</p>
        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading text-center">
          <h1>Patter is Open</h1>
          <img src="images/open-fig.png" alt="Patter is compatible with many mobile apps" width="320" height="318">
        </div>
        <div class="panel-body text-center">
          <p>Patter uses the <code>io.core.pnut.chat</code> protocol, built on pnut.io.</p>
          <p>The Patter web application is <b>open source</b>. You can contribute <a href="https://github.com/33mhz/pnut-patter">here</a>.</p>
        </div>
      </div>
      <div class="panel panel-default panel-primary">
        <div class="panel-heading text-center">
          <h1>Getting Started</h1>
        </div>
        <div class="panel-body text-center" style="background-color: #eeeeff">
          <p><a class="authorize-button" style="visibility:hidden;" data-size="22">Login or Signup</a></p>
          <p>After authorizing your account or creating a new one, you can:</p>
          <p><b>Search</b> the Patter Directory for public rooms</p>
          <p><b>Message</b> your friends privately</p>
          <p><b>Create</b> your own rooms</p>
        </div>
      </div>
      <div class="well well-small">
        <p>For troubleshooting, contact <a href="https://pnut.io/@33mhz">@33MHz</a>.</p>
        <p>Our privacy policy is <a href="http://www.privacychoice.org/policy/mobile?policy=7e57611e9551c6105db81e5c27f3a415">here</a>.</p>
        <p>Patter interacts with <a href="https://pnut.io">pnut.io</a> on your behalf, and any message you create will be subject to their policies.</p>
      </div>
    </div>

    {% block body %}
    {% endblock %}
    {% block bottom_js %}
    {% endblock %}
  </body>
</html>
