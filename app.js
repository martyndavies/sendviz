var express = require('express')
  , http = require('http')
  , path = require('path')
  , Pusher = require('node-pusher')
  , request = require('request')
  , util = require('util')
  , md5 = require('MD5')
  , SendGrid = require('sendgrid').SendGrid


var pusher = new Pusher({
  appId: '32762',
  key: '2b077135af8bee994bb3',
  secret: '4c32bbaf9c1cec185903'
});

var channel = 'sendviz';
var socket_id = null;

// Define the SendGrid stuff
var sendgrid = new SendGrid(process.env["SENDGRID_USERNAME"], process.env["SENDGRID_PASSWORD"]);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

function hashifyEmailPls(emailAddress, callback) {
  var hashed_email_address = md5(emailAddress);
  callback(hashed_email_address);
};

function send(event, data, socket_id){
  pusher.trigger(channel, event, data, socket_id, function(err, req, res) {
    if (err) {
      console.log(err);
    } else {
      console.log("Sending "+ data.event_type +" for "+ data.email);
    }
  });
};

app.get("/", function(req, res) {
  res.render('index', {title: "SendViz"});
});

app.post("/events", function(req, res){
  eventType = req.body.event;
  emailAddress = req.body.email;

  hashifyEmailPls(emailAddress, function(hashedEmail){
    switch(eventType){

      case "processed":
        var data = { email: hashedEmail, event_type: "processed" };
        send('processed', data, socket_id);
        break;

      case "deferred":
        var data = { email: hashedEmail, event_type: "deferred" };
        send('deferred', data, socket_id);
        break;

      case "delivered":
        var data = { email: hashedEmail, event_type: "delivered" };
        send('delivered', data, socket_id);
        break;

      case "open":
        var data = { email: hashedEmail, event_type: "open" };
        send('open', data, socket_id);
        break;

      case "click":
        var data = { email: hashedEmail, event_type: "click" };
        send('click', data, socket_id);
        break;

      case "bounce":
        var data = { email: hashedEmail, event_type: "bounce" };
        send('bounce', data, socket_id);
        break;

      case "dropped":
        var data = { email: hashedEmail, event_type: "dropped" };
        send('dropped', data, socket_id);
        break;

      case "spamreport":
        var data = { email: hashedEmail, event_type: "spamreport" };
        send('spamreport', data, socket_id);
        break;
    }

  });

});

http.createServer(app).listen(app.get('port'), function(){
  console.log("S-Express is proper dancing on port " + app.get('port'));
});
