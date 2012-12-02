$(document).ready(function(){

  var headings = new Array();

  headings[0] = "Processed";
  headings[1] = "Deferred";
  headings[2] = "Delivered";
  headings[3] = "Open";
  headings[4] = "Click";
  headings[5] = "Bounced";
  headings[6] = "Dropped";
  headings[7] = "Spam Report";

  var events = new Array();

  events[0] = "processed";
  events[1] = "deferred";
  events[2] = "delivered";
  events[3] = "open";
  events[4] = "click";
  events[5] = "bounced";
  events[6] = "dropped";
  events[7] = "spamreport";

  for (var i; i<headings.length; i++){
    localStorage.set(headings[i], "0");
  }

  var processed_count = 0
    , spamreport_count = 0
    , delivered_count = 0
    , deferred_count = 0
    , open_count = 0
    , click_count = 0
    , bounce_count = 0
    , dropped_count = 0;

  var dataset = {
    events: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
  };

  Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
  };

  // Flash fallback logging - don't include this in production
  WEB_SOCKET_DEBUG = false;
  var pusher = new Pusher('2b077135af8bee994bb3');
  var channel = pusher.subscribe('sendviz');

  // Helpers

  function doFlash(el){
    console.log("Flashing "+el);
    $('li#'+el).live($(this).animate({boxShadow: '0 0 30px #44f'}), function(){});
  }


  function increment_score(eventType, amount){
    $("div#"+eventType).html(amount);
    console.log ("Looking for "+eventType);
    var event_id = events.indexOf(eventType);
    dataset.events[event_id] = amount;
    console.log("Changed ID: "+ dataset.events[event_id]+" to "+ amount);
    change();
    //localStorage.set(eventType, amount);
    //doFlash(eventType);
  }

  function addGravatar(emailHash) {
    console.log("Adding Gravatar: http://www.gravatar.com/avatar/"+emailHash);
    $("#photo-strip").append("<li><img src='http://www.gravatar.com/avatar/"+emailHash+"'/></li>");
  }

  channel.bind('processed', function(data){
    processed_count++;
    increment_score(data.event_type, processed_count);
  });

  channel.bind('spamreport', function(data){
    spamreport_count++;
    increment_score(data.event_type, spamreport_count);
  });

  channel.bind('delivered', function(data){
    delivered_count++;
    increment_score(data.event_type, delivered_count);
    addGravatar(data.email);
  });

  channel.bind('deferred', function(data){
    deferred_count++;
    increment_score(data.event_type, deferred_count);
  });

  channel.bind('open', function(data){
    open_count++;
    increment_score(data.event_type, open_count);
  });

  channel.bind('click', function(data){
    click_count++;
    increment_score(data.event_type, click_count);
  });

  channel.bind('bounce', function(data){
    bounce_count++;
    increment_score(data.event_type, bounce_count);
  });

  channel.bind('dropped', function(data){
    dropped_count++;
    increment_score(data.event_type, dropped_count);
  });

  var window_width = $(window).width();
  var width_of_info_box = Math.floor(window_width/9)-10;
  for (var i=0; i < 8; i++) {
    var title_div = "<div class='event-header'>"+headings[i]+"</div>";
    var number_div = "<div class='number' id='"+headings[i].toLowerCase().replace(/\s+/g, '')+"'>0</div>";
    $("#info-boxes").append("<li class='info-box' id='"+headings[i]+"'style='width:"+width_of_info_box+"px;'>"+title_div+number_div+"</li>");
  }



  var width = 960,
      height = 500,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.category10();

  var pie = d3.layout.pie()
      .sort(null);

  var arc = d3.svg.arc()
      .innerRadius(radius - 100)
      .outerRadius(radius - 20);

  var svg = d3.select("#graph").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var path = svg.selectAll("path")
      .data(pie(dataset.events))
      .enter().append("path")
      .attr("fill", function(d, i) { return color(i); })
      .attr("d", arc)
      .each(function(d) { this._current = d; }); // store the initial values

  function change() {
    //clearTimeout(timeout);
    console.log("Transitioning:" + dataset.events);
    path = path.data(pie(dataset.events)); // update the data
    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
  }

  // Store the displayed angles in _current.
  // Then, interpolate from _current to the new angles.
  // During the transition, _current is updated in-place by d3.interpolate.
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }


// end
});