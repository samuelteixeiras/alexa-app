var alexa = require('alexa-app');

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

var COUNT = "count";
var bh = ["02/April","07/May","04/June", "06/August","29/October","25/December","26/December"];

/**
* Provide information about the skill.
**/
function aboutIntent(req, res) {

    var message = ["You can now when is the next Ireland bank holiday."
    ].join("<break time='1s'/>");
    res.say(message).send();
    res.card("Create by Samuel Teixeira samuelteixeiras@gmail.com", message);
  
}

function nextHolidayIntent(req, res) {

  // start the count in the session
  var next = res.session[COUNT] + 1;
  console.log(bh);
  console.log(next);
  if(bh.length <= next ){

    res.session[COUNT,next];
    var splitDate = bh[next].split("/");  
    var message = "The next bank holidays is "+ splitDate[0]+ " of "+ splitDate[1] +" <break time='500ms'/>";
    var reprompt = "Do you want no the next one?";
    res.say(message).reprompt(reprompt).shouldEndSession(false);
  } else {
    var message = "I am sorry, next bank holidays is next year";
    res.shouldEndSession(true).say(message);
  }
}

// Define an alexa-app 
var app = new alexa.app('bankholidays');



app.intent('AboutIntent', {
  "slots": {}
  , "utterances": ["about | about skill | about developer | tell me more about | who create this app | who create this skill "]
}, function (req, res) { aboutIntent(req, res); return false; });


app.intent('NextHolidayIntent', {
  "slots": {}
  , "utterances": ["yes|next|next holiday|sure|of course|yes please|please"]
}, function (req, res) { nextHolidayIntent(req, res); return false; }

);

app.intent("AMAZON.HelpIntent", {
  "slots": {},
  "utterances": []
},
function(request, response) {
  var helpOutput = "You can say what's the next bank holiday. You can also say stop or exit to quit.";
  var reprompt = "What would you like to do?";
  // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
  response.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
}
);

app.intent("AMAZON.StopIntent", {
  "slots": {},
  "utterances": ["stop"]
}, function(request, response) {
  var stopOutput = "Bye";
  response.say(stopOutput);
}
);

app.intent("AMAZON.CancelIntent", {
  "slots": {},
  "utterances": []
}, function(request, response) {
  var cancelOutput = "Request cancelled.";
  response.say(cancelOutput);
});



app.launch(function (req, res) {
  // start the count in the session
  res.session[COUNT,0];
  var splitDate = bh[0].split("/");  
  var message = "Hi, you can ask about the next bank holidays.<break time='500ms'/>"+
      "Example:<break time='300ms'/>The next bank holidays is "+ splitDate[0]+ " of "+ splitDate[1] +" <break time='500ms'/>"+
      "Do you want no the next one?";
  // don't close the session in the launch.
 // res.say(message);
  //return res.send();

  var message = "Welcome to dublin bikes skill by Samuel Teixeira.,<break time='300ms'/> You can use thie skill asking about your station number or ,<break time='300ms'/> station name.,<break time='500ms'/>";
  message+="Example:<break time='300ms'/>Alexa ask dublin bikes station 42.<break time='300ms'/>or , Alexa ask dublin bikes station Dame Street.";
  res.say(message);
  res.card("Created by Samuel Teixeira",message);
});



app.pre = function(request, response, type) {
  console.log("type -------------------------------------");
  console.log(type);
  console.log("request -------------------------------------");
  console.log(request);

  console.log("request.intent -------------------------------------");
  console.log(request.intent);
 

};

module.exports = app;