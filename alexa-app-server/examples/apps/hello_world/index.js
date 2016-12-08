var alexa = require('alexa-app');
var utterances = require('alexa-utterances');
var jsdom = require('jsdom')
, request = require('request')
, url = require('url');


// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;


function convertToMinutes(time){
     var d1 = new Date();
     var auxDate = time.split(":");
     var d2 = new Date(d1.getFullYear(),d1.getMonth(),d1.getDate(),auxDate[0],auxDate[1],0,0);
     var minutes = Math.floor((d2 - d1) / 60000);
     return minutes;
}

function makeCard(route,destination,expectedTime){
    card  ="--------------------------"+
                              "\r\nRoute: "+route+
                              "\r\nDestination: "+destination+
                              "\r\nExpected Time: "+expectedTime+
          "\r\n--------------------------\r\n\r\n";
    return card;
}

function getInfo($,bus,res){

    var cont = 0;
    var aux = "";
    var card = "";

    $("#rtpi-results tbody tr").each(function(index){

      if(cont > 0 ){
         
          if($(this).find("td").eq(2).html().trim() != "due"){
              time = convertToMinutes($(this).find("td").eq(2).html().trim());
          } else {
             time = 0;
          }
          busNumber    =  $(this).find("td").eq(0).html().trim();
          destination  =  $(this).find("td").eq(1).html().trim();
          originalTime = $(this).find("td").eq(2).html().trim();

          if(bus == "0"){
              card += makeCard(busNumber,destination,originalTime);
              aux += 'bus ' + busNumber + '<break time="0.5s"/> in ' + time + ' minutes <break time="1s"/>';
          } else if(bus == busNumber){
                  card += makeCard(busNumber,destination,originalTime);
                  aux += 'bus ' + busNumber + ' in ' + time + ' minutes <break time="1s"/>';
          }
         
      }

      cont++;

    });

    //console.log(aux);
    //console.log(card);
    res.say(aux).send();
    res.card("Dublin Bus by Samuel Teixeira",card);
    
}


function getBusInformation(stop,bus,res){

	var url = "https://www.dublinbus.ie/RTPI/Sources-of-Real-Time-Information/?searchtype=view&searchquery="+stop;

    //console.log(url);

	request({uri: url}, function(err, response, body){
                var self = this;
                self.items = new Array();
              
                if(err && response.statusCode !== 200){console.log('Request error.');}
               
                 jsdom.env(
                 body,
                ["http://code.jquery.com/jquery.js"],
                function (err, window) {
                        var $ = window.jQuery;
                        getInfo($,bus,res);
                });

        });
}


// Define an alexa-app 
var app = new alexa.app('helloworld');
app.launch(function(req,res) {
	var message = "Welcome to dublin bus skill by Samuel Teixeira.,<break time='300ms'/> You can use thie skill asking about your stop number or ,<break time='300ms'/> stop number and bus number.,<break time='500ms'/>";
		message+="Example:<break time='300ms'/>Alexa ask dublin bus stop 274.<break time='300ms'/>or , Alexa ask dublin bus stop 274 and bus 38a";
	res.say(message);

});


app.intent('AboutIntent', {
		"slots":{}
        ,"utterances":["about | about skill | about developer | tell me mor about | who create this app | who create this skill "]
        },function(req,res) {

	    var message=["Dublin bus is a Amazon echo skill created by Samuel Teixeira in Dublin,<break time='300ms'/> " +
	  				 "Using dublin bus you can get information about bus routes in real time.<break time='500ms'/>For more info visit www.samuelteixeira.com.br."
				    ].join("<break time='1s'/>");
        res.say(message);
        res.card("Dublin bus create by Samuel Teixeira",message);

        }
);

app.intent('BusStopIntent', {
		"slots":{"stopNumber":"NUMBER"}
                ,"utterances":["stop {1-100|stopNumber}"]
        },function(req,res) {

        //console.log("BusStopIntent");

        //console.log(req.slot('stopNumber')); 	
     	getBusInformation(req.slot('stopNumber'),"0",res);
     	return false;

        }
);

	var dictionary = { bus: [ '1', '11','15','15a','15b','15n','38','38a' ] };
	var slots = { LIST_OF_BUS: 'LITERAL' };
	var template = 'stop {1-100|stopNumber} and bus {bus|LIST_OF_BUS}';
	var result = utterances(template, slots, dictionary);



var test = {
                "slots":{"stopNumber":"NUMBER","bus":"LIST_OF_BUS"}
                ,"utterances":result
        };

app.intent('BusStopAndBusIntent', test ,function(req,res) {
                //console.log(req);
                //console.log(req.slot('stopNumber'));
                //console.log(req.slot('bus'));

                var busAux = req.slot('bus').split(" ");
                //console.log(busAux.length);
                if(busAux.length > 1){
                	bus = busAux[0]+busAux[1];
                }else{
                	bus = busAux[0];
                }
                //console.log(bus);


                //console.log(req.slot('stopNumber')); 	
     			getBusInformation(req.slot('stopNumber'),bus,res);
     			return false;
                //res.say('Your stop number  is '+ req.slot('stopNumber') + ' and your bus is ' + req.slot('bus'));
        }
);

module.exports = app;

