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
    //localStorage.set(eventType, amount);
    //doFlash(eventType);
  }

  function addGravatar(emailHash) {
    console.log("Adding Gravatar: http://www.gravatar.com/avatar/"+emailHash);
    $("#photo-strip").append("<li><img src='http://www.gravatar.com/avatar/"+emailHash+"'/></li>");
  }

  channel.bind('processed', function(data){
    processed_count++;
    transition_graph(processed_count);
    increment_score(data.event_type, processed_count);
  });

  channel.bind('spamreport', function(data){
    spamreport_count++;
    transition_graph(spamreport_count);
    increment_score(data.event_type, spamreport_count);
  });

  channel.bind('delivered', function(data){
    delivered_count++;
    transition_graph(delivered_count);
    increment_score(data.event_type, delivered_count);
    addGravatar(data.email);
  });

  channel.bind('deferred', function(data){
    deferred_count++;
    transition_graph(deferred_count);
    increment_score(data.event_type, deferred_count);
  });

  channel.bind('open', function(data){
    open_count++;
    transition_graph(open_count);
    increment_score(data.event_type, open_count);
  });

  channel.bind('click', function(data){
    click_count++;
    transition_graph(click_count);
    increment_score(data.event_type, click_count);
  });

  channel.bind('bounce', function(data){
    bounce_count++;
    transition_graph(bounce_count);
    increment_score(data.event_type, bounce_count);
  });

  channel.bind('dropped', function(data){
    dropped_count++;
    transition_graph(dropped_count);
    increment_score(data.event_type, dropped_count);
  });

  var window_width = $(window).width();
  //var amount_of_li = Math.floor(window_width/80)+1;
  //for (var i=0; i < amount_of_li; i++) {
  //  $("#photo-strip").append("<li><img src='http://www.gravatar.com/avatar/d2fcf07e0aaeab2ec0ccc106851c4f96'/></li>");
  //}

  var width_of_info_box = Math.floor(window_width/9)-10;
  for (var i=0; i < 8; i++) {
    var title_div = "<div class='event-header'>"+headings[i]+"</div>";
    var number_div = "<div class='number' id='"+headings[i].toLowerCase().replace(/\s+/g, '')+"'>0</div>";
    $("#info-boxes").append("<li class='info-box' id='"+headings[i]+"'style='width:"+width_of_info_box+"px;'>"+title_div+number_div+"</li>");
  }

  //D3
  var n = 9, // number of layers
      m = 2000, // number of samples per layer
      stack = d3.layout.stack().offset("zero"),
      layers0 = stack(d3.range(n).map(function() { return bumpLayer(m); })),
      layers1 = stack(d3.range(n).map(function() { return bumpLayer(m); }));

  var width = $(window).width(), height = $(window).height()-200;

  var x = d3.scale.linear()
    .domain([0, m - 1])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
    .range([height, 0]);

  var color = d3.scale.linear()
    .range(["#33ccff", "#006699"]);

  var area = d3.svg.area()
    .x(function(d) { return x(d.x); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

  var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.selectAll("path")
    .data(layers0)
    .enter().append("path")
    .attr("d", area)
    .style("fill", function() { return color(Math.random()); });

  function transition() {
    d3.selectAll("path")
      .data(function() {
        var d = layers1;
        layers1 = layers0;
        return layers0 = d;
    })
      .transition()
      .duration(3000)
      .attr("d", area);
  }

  function transition_graph(amount){

  }

  function bumpLayer(n) {

    function bump(a) {
      var x = 1 / (.1 + Math.random()),
          y = 2 * Math.random() - .5,
          z = 10 / (.1 + Math.random());
      for (var i = 0; i < n; i++) {
        var w = (i / n - y) * z;
        a[i] += x * Math.exp(-w * w);
      }
    }

    var a = [], i;
    for (i = 0; i < n; ++i) a[i] = 0;
    for (i = 0; i < 9; ++i) bump(a);
    return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
  }


// end
});