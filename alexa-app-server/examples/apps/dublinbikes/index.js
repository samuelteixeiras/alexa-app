var alexa = require('alexa-app');
var utterances = require('alexa-utterances');
var jsdom = require('jsdom')
, request = require('request')
, url = require('url');
var stations = require("./stations");


// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;



function makeCard(stationName,stationNumber,availableStands,availableBikes){
    card  ="--------------------------"+
                              "\r\nStation: "+stationName+
                              "\r\nNumber: "+stationNumber+
                              "\r\nAvailable stands: "+availableStands+
                              "\r\nAvailable bikes: "+availableBikes+
          "\r\n--------------------------\r\n\r\n";
    return card;
}




function getStationInformation(stationNumber,res){

	var url = "https://api.jcdecaux.com/vls/v1/stations/"+ stationNumber +"?contract=Dublin&apiKey=224178647f184a8dd51d74c1a2c2c61c6a2ed50e";

  //console.log(url);

	request({uri: url}, function(err, response, body){
              //console.log(response.body);
              var info = JSON.parse(response.body);
              //console.log(info);
              //console.log(info["available_bike_stands"]);
              //console.log(info["available_bikes"]);
              if(info["status"] == "OPEN"){
                var message = "Station " + info["name"] +  "<break time='300ms'/>number "+ info["number"];
                    message +="<break time='300ms'/> available stands <break time='300ms'/>" + info["available_bike_stands"] ;
                    message +="<break time='300ms'/>available bikes <break time='300ms'/>" + info["available_bikes"];
                    message +="<break time='1s'/> available stands <break time='300ms'/>" + info["available_bike_stands"] ;
                    message +="<break time='300ms'/>available bikes <break time='300ms'/>" + info["available_bikes"];
                    //console.log(message);
                    //console.log(res);
                res.say(message).send();
                var card = makeCard(info["name"],info["number"],info["available_bike_stands"],info["available_bikes"]);
                res.card("Dublin bikes by Samuel Teixeira",card);
              } else{
                res.say("The bike station is closed.").send();
              } 


        });
}


// Define an alexa-app 
var app = new alexa.app('dublinbikes');

app.launch(function(req,res) {

  
  //getStationInformation(stations["stations"]["SMITHFIELD NORTH"].number,res);

  //console.log(stations["SMITHFIELD NORTH"]);
  var message = "Welcome to dublin bikes skill by Samuel Teixeira.,<break time='300ms'/> You can use thie skill asking about your station number or ,<break time='300ms'/> station name.,<break time='500ms'/>";
      message+="Example:<break time='300ms'/>Alexa ask dublin bikes station 42.<break time='300ms'/>or , Alexa ask dublin bikes station Dame Street.";
  res.say(message);
});


app.intent('AboutIntent', {
		"slots":{}
        ,"utterances":["about | about skill | about developer | tell me mor about | who create this app | who create this skill "]
        },function(req,res) {

	    var message=["Dublin bikes is a Amazon echo skill created by Samuel Teixeira in Dublin,<break time='300ms'/> " +
	  				 "Using dublin bus you can get bike station information real time.<break time='500ms'/>For more info visit www.samuelteixeira.com.br."
				    ].join("<break time='1s'/>");
        res.say(message);
        res.card("Dublin bus create by Samuel Teixeira",message);

        }
);

app.intent('GetStationInformationIntent', {
		"slots":{"stationName":"LITERAL"}
                ,"utterances":["station {BLESSINGTON STREET|stationName}"]
        },function(req,res) {

          var stationName  = req.slot('stationName').toUpperCase().trim();
          console.log(stationName);
          if(stations["stations"][stationName] != undefined){


            getStationInformation(stations["stations"][stationName].number,res);         	 
            //res.say("Station name: "+ stationName);
            return false;
          } else {
            res.say("Station "+ stationName +"not found");
          }
        }
);

app.intent('GetStationNumberInformationIntent', {
    "slots":{"stationNumber":"NUMBER"}
                ,"utterances":["station number {stationNumber}"]
        },function(req,res) {

          if(req.slot('stationNumber') != undefined){


            getStationInformation(req.slot('stationNumber'),res);           
            //res.say("Station name: "+ stationName);
            return false;
          } else {
            res.say("Station number"+ stationName +" not found");
          }
        }
);



module.exports = app;

