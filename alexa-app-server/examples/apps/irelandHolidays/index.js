var alexa = require('alexa-app');
var utterances = require('alexa-utterances');
var jsdom = require('jsdom')
  , request = require('request')
  , url = require('url');


// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

var COUNT = "count";

/**
* Provide information about the skill.
**/
function AboutIntent(req, res) {

    var message = ["You can now when is the next Ireland bank holiday."
    ].join("<break time='1s'/>");
    res.say(message);
    res.card("Create by Samuel Teixeira samuelteixeiras@gmail.com", message);
  
}

function NextHolidayIntent(req, res) {

  // start the count in the session
  var next = res.session[COUNT] + 1;

  if(bh.length <= next ){

    res.session[COUNT,next];
    var splitDate = bh[next].split("/");  
    var message = "The next bank holidays is "+ splitDate[0]+ " of "+ splitDate[1] +" <break time='500ms'/>"+
    "Do you want no the next one?";
    res.shouldEndSession(false).say(message);
  } else{
    var message = "I am sorry, next bank holidays is next year";
    res.shouldEndSession(true).say(message);
  }
}

// Define an alexa-app 
var app = new alexa.app('bankholidays');

var bh = ["02/April","07/May","04/June", "06/August","29/October","25/December","26/December"];

app.intent('AboutIntent', {
  "slots": {}
  , "utterances": ["about | about skill | about developer | tell me mor about | who create this app | who create this skill "]
}, function (req, res) { AboutIntent(req, res); return false; });


app.intent('NextHolidayIntent', {
  "slots": {}
  , "utterances": ["yes | next | next holiday | sure | of course | yes please | please"]
}, function (req, res) { AboutIntent(req, res); return false; });



app.launch(function (req, res) {
  // start the count in the session
  res.session[COUNT,0];
  var splitDate = bh[0].split("/");  
  var message = "Hi, you can ask about the next bank holidays.<break time='500ms'/>";
  message += "Example:<break time='300ms'/>The next bank holidays is "+ splitDate[0]+ " of "+ splitDate[1] +" <break time='500ms'/>"+
  "Do you want no the next one?";
  // don't close the session in the launch.
  res.shouldEndSession(false).say(message);
});

module.exports = app;