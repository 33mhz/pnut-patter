{% extends 'faq_base.swig' %}
{% block title %}FAQ{% endblock %}

{% block body %}
  <script>window.document.getElementById('lang_en').className = 'active';</script>
  <div class="container">
    <div class="page-header">
      <h1>Patter FAQ</h1>
    </div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>General</h1>
      </div>
      <h2>What is Patter?</h2>
      <p>Patter is a messaging web client. It runs entirely on <a href="https://pnut.io">Pnut</a> and provides both public and private chat rooms. When you talk in these chat rooms, your messages do not appear in the main Pnut stream and instead only appear in whichever room your are talking in.</p>
      <p>Since Patter is implemented entirely as a protocol on top of Pnut, any client or app can interoperate with the Patter web client. See below for current clients that support Patter rooms.</p>
      <h2>How does it work?</h2>
      <p>The Patter web client runs entirely in your web browser and posts your messages to Pnut channels. Each of these channels stores a Private Message conversation or a Patter room. The messages are stored permanently unless deleted by their owners. This allows Patter to operate both as a real-time chat client and for delayed messaging where the other person can come back and read your message a week later.</p>
      <h2>What is the difference between public and private Patter rooms?</h2>
      <p>Public Patter rooms allow anyone to read and participate. Private rooms can only be seen by their participants. Patter also allows publicly-readable rooms. These are rooms that can be read by anyone but only a few people can post messages to them.</p>
      <p>Some public or publicly readable rooms are also promoted rooms. A promoted room will appear in the Patter directory with a short description of what the room is for. If you create a public room but don't promote it, others will still be able to see and participate in the room.
      <h2>What is the difference between Private Messaging and private Patter rooms?</h2>
      <p>Private Messages are a special kind of room provided by Pnut itself. Each group of people have a unique private message room and it has no name. You cannot change the membership of the room later or make it public. To add another person you need to create a new private messaging group including that new person.</p>
      <p>By contrast, Patter rooms are always mutable. The owner can add or remove people to a private room later or change it from a private room to a public room later. You can also create more than one Patter room among the same group of people or even create a private Patter room with just yourself in it.</p>
      <h2>How private is private?</h2>
      <p>Private messages and Patter rooms are stored in plaintext on the Pnut servers. In addition, any application that you authorize with the 'messages' scope will be able to fetch your private messages. This puts private messages and Patter rooms about equal with email in terms of privacy. They are reasonably private but you should avoid plotting world domination or putting your credit card number in the chat.</p>
      <p>Private messages are slightly more private than private Patter rooms. This is because the owner of a private Patter room can later change it into a public Patter room. This would make all the previous messages publicly available. Private messages can never be anything else.</p>
      <h2>I don't see anyone in a room. Is this a ghost town?</h2>
      <p>The list of users on the side bar are the recent posters. Many more people may be subscribed to a room. Post your question or comment and you will likely receive an answer when one of them next checks their messages. Remember that Patter messages are stored forever so you don't have to worry about your message disappearing into the ether if nobody happens to be around to receive it.</p>
      <p>Many Patter rooms remain dormant for hours until somebody says something and then a few people will converse in real time for a while. Some only receive occasional messages as the main people using the room live in different time zones or have different schedules.</p>
      <p>Always jump in and say something and you'd be surprised how often you get an answer.</p>
      <h2>What clients support Patter?</h2>
      <p>iOS: Chimpnut, Arachis.</p>
      <p>Mac: Apero, enuts</p>
      <p>Android: Robin, Goober, Dale</p>
      <p>Web: Patter, Beta, Broadsword, JellyTime, Noodle...</p>
      <p>Windows: enuts</p>
      <h2>How do I get notifications for Patter rooms?</h2>
      <p>On iOS, Arachis and Chimpnut support notifications for private Patter rooms.</p>
      <p>You may also use Pnut's official E-mail notifications, logging into your account at <a href="https://pnut.io/account">Pnut.io</a>.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Chatting</h1>
      </div>
      <h2>What is send? What is broadcast?</h2>
      <p>Send adds the message you've typed to the current room. This is the default behaviour when tapping enter. Broadcast both creates a messages in the current room and a post in your stream. The post includes a link back to the room you are in so it is a great way to invite others into the room or mention them to get their attention. Broadcasts are only allowed from public rooms or publicly-readable rooms.</p>
      <h2>What does subscribing do?</h2>
      <p>Subscribing to a room will make it appear in your 'My Rooms' list in the lobby. Your subscriptions are also used to notify you if you have a client that supports notifications. Many clients with Patter support do not show the Patter directory or manage your subscriptions. Instead, they show only the rooms you have subscribed to. In those cases, you can subscribe to rooms with the web client and then read and chat in those rooms with the other app.</p>
<!--      <h2>How do I use Emoji?</h2>
      <p>All the emoji listed at http://www.emoji-cheat-sheet.com/ are supported. Simply enter the name surrounded by colons and the emoji will appear in the web client. If the other person does not have a client that supports emoji, they will still see the emoji name.</p>
      <p>These emoji are owned and created by Apple and their license is dubious. The main Patter client will be moving to the Phantom Open Emoji when there are enough of them. http://www.kickstarter.com/projects/374397522/phantom-open-emoji</p>
-->
      <h2>How do I post images?</h2>
      <p>If you paste in a URL that ends with .png, .jpg, or .gif then it will be auto-embedded in the stream.</p>
      <h2>What do the colors mean?</h2>
      <p>In the lobby, green rooms have unread messages.</p>
      <p>Inside of a room, the user list will fade out usernames that have not posted in the last few minutes. After 10 idling minutes, they will be removed from the list.</p>
      <p>Posts that mention you and posts that you create are styled in a different background color for ease of lookup.</p>
      <p>@michelelewis is green. Just because.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Rooms</h1>
      </div>
      <h2>I want to change my room. How do I do it?</h2>
      <p>You can only change a room if you are the owner of that room and it is a Patter room. When viewing the room, click 'Edit Room' from the menu bar at the top and you can add/remove users, change the permissions, setup promotion for the room, and edit its name.</p>
      <h2>Can I delete my room?</h2>
      <p>You cannot delete a room right now. If you want to just forget about a room, edit the room so that it is private and nobody else is allowed in then unsubscribe. If the room has sensitive messages or other information in it, you will need to delete those messages separately. There is no easy way yet to mass-delete messages but if the need arises, contact @duerig and I can work on adding this feature.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Support</h1>
      </div>
      <h2>Somebody is harassing me. What can I do?</h2>
      <p>You should mute, block, or report them. You can go to that user's profile on Alpha to mute or block them. If necessary, contact Pnut support. Since Patter is a pure client on top of Pnut, all resolution must happen on Pnut itself.</p>
      <p>After muting or blocking a user, you should no longer see either messages or channels created by that user.</p>
      <h2>I keep getting resubscribed to a room. What can I do?</h2>
      <p>When a private message is sent, it auto-resubscribes all participants to a room. If there is a particular room or private message conversation you would like to avoid, you can click the mute button next to that thread in the lobby. If you do this, you can no longer be resubscribed to the room by anyone else.</p>
      <p>There is also a Pnut setting at pnut.io/account/privacy which allows you limit who else can auto-subscribe you to a room. Click Privacy and then select which group of people can send you messages. This setting will not affect existing rooms that you've subscribed to. But it can prevent others from subscribing you to rooms that they create.</p>
      <h2>Something is broken. Who do I talk to?</h2>
      <p>You should first contact the author of whichever client you are using (Patter for iOS is by @boxenjim). If you have a problem with the web client or if it is an issue that can't be resolved that way, feel free to contact me (@33MHz). Have fun using Patter!</p>
    </div></div>
  </div>
{% endblock %}
