var alexa = require('alexa-app');
var utterances = require('alexa-utterances');
var jsdom = require('jsdom')
  , request = require('request')
  , url = require('url');


// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;




/**
* Provide information about the skill.
**/
function AboutIntent(req, res) {

  var message = ["This skill is not an official dublin bus publication. It is not sponsored or endorsed by Dublin Bus.,<break time='300ms'/> " +
    "Using dublin bus you can get information about bus routes in real time.<break time='500ms'/>For more info visit www.samuelteixeira.com.br."
  ].join("<break time='1s'/>");
  res.say(message);
  res.card("Dublin bus create by Samuel Teixeira", message);

}


/**
* get the bus number / bus number and letter. 
* e.g. bus fifteen b (15B)
**/
function BusStopAndBusIntent(req, res) {

  var busAux = req.slot('bus').split(" ");
  if (busAux.length > 1) {
    bus = busAux[0] + busAux[1];
  } else {
    bus = busAux[0];
  }
  getBusInformation(req.slot('stopNumber'), bus, res);
  // return false to wait for the response of the function above.
  return false;
}

function convertToMinutes(time) {
  var d1 = new Date();
  var auxDate = time.split(":");
  var d2 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), auxDate[0], auxDate[1], 0, 0);
  var minutes = Math.floor((d2 - d1) / 60000);
  return minutes;
}

/**
* Make the card to display more information using the bus and bus route.
**/
function makeCard(route, destination, expectedTime) {
  card = "--------------------------" +
    "\r\nRoute: " + route +
    "\r\nDestination: " + destination +
    "\r\nExpected Time: " + expectedTime +
    "\r\n--------------------------\r\n\r\n";
  return card;
}

/**
* Get the information from the html returned.
**/
function getInfo($, bus, res, stop) {

  var cont = 0;
  var aux = "";
  var card = "";

  $("#rtpi-results tbody tr").each(function (index) {


    // don't  use the first line , because today is the headers.
    if (cont > 0) {

      if ($(this).find("td").eq(2).html().trim() != "due") {
        time = convertToMinutes($(this).find("td").eq(2).html().trim());
      } else {
        time = 0;
      }

      busNumber = $(this).find("td").eq(0).html().trim();
      destination = $(this).find("td").eq(1).html().trim();
      originalTime = $(this).find("td").eq(2).html().trim();

      if (bus == "0") {
        card += makeCard(busNumber, destination, originalTime);
        aux += 'bus ' + busNumber + '<break time="0.5s"/> in ' + time + ' minutes <break time="1s"/>';
      } else if (bus == busNumber) {
        card += makeCard(busNumber, destination, originalTime);
        aux += 'bus ' + busNumber + ' in ' + time + ' minutes <break time="1s"/>';
      }

    }

    cont++;

  });

  if (aux == "" && bus != "0") {
    res.say("I can't find this bus in the stop " + stop).send();
  } else if (aux == "") {
    res.say("I can't find any bus information in the stop " + stop).send();
  } else {
    res.say(aux).send();
    res.card("Dublin Bus by Samuel Teixeira", card);
  }
}

/**
* Go into the dublin bus website and return the html using he stop number.
**/
function getBusInformation(stop, bus, res) {

  var url = "https://www.dublinbus.ie/RTPI/Sources-of-Real-Time-Information/?searchtype=view&searchquery=" + stop;

  request({ uri: url }, function (err, response, body) {
    var self = this;
    self.items = new Array();

    if (err && response.statusCode !== 200) { console.log('Request error.'); }

    jsdom.env(
      body,
      ["http://code.jquery.com/jquery.js"],
      function (err, window) {
        var $ = window.jQuery;
        getInfo($, bus, res, stop);
      });

  });
}


// Define an alexa-app 
var app = new alexa.app('dublinbus');


app.launch(function (req, res) {
  var message = "This skill is not sponsored or endorsed by Dublin Bus.,<break time='300ms'/> You can use this skill asking about your stop number or ,<break time='300ms'/> stop number and bus number.,<break time='500ms'/>";
  message += "Example:<break time='300ms'/>Alexa ask dublin bus stop 274.<break time='300ms'/>or , Alexa ask dublin bus stop 274 and bus 38a";
  // don't close the session in the launch.
  res.shouldEndSession(false).say(message);
});


app.intent('AboutIntent', {
  "slots": {}
  , "utterances": ["about | about skill | about developer | tell me mor about | who create this app | who create this skill "]
}, function (req, res) { AboutIntent(req, res); return false; });

app.intent('BusStopIntent',
  {
    "slots": { "stopNumber": "NUMBER" },
    "utterances": ["stop {1-100|stopNumber}"]
  },
  function (req, res) {
    getBusInformation(req.slot('stopNumber'), "0", res);
    return false;
  });

// test dictionary
var dictionary = { bus: ['1', '11', '15', '15a', '15b', '15n', '38', '38a'] };
var slots = { LIST_OF_BUS: 'LITERAL' };
var template = 'stop {1-100|stopNumber} and bus {bus|LIST_OF_BUS}';
var result = utterances(template, slots, dictionary);
var busStopAndBusIntent = {
  "slots": { "stopNumber": "NUMBER", "bus": "LIST_OF_BUS" }
  , "utterances": result
};

app.intent('BusStopAndBusIntent', busStopAndBusIntent, function (req, res) { BusStopAndBusIntent(req, res); return false; });




module.exports = app;

