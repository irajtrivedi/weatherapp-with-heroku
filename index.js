/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
const express = require('express');
const bodyParser = require('body-parser');
const http = require('https');
const host = 'https://query.yahooapis.com';

const server = express();
server.use(bodyParser.json());

server.post('/get-details', function (req, res) {
//exports.get_movie_details = (req, res) => {
  //response = "This is Raj's Custom Msg!" + req.body.message //Default response from the webhook to show it's working
  //res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  //res.send(JSON.stringify({ "speech": response, "displayText": response 
  //"speech" is the spoken version of the response, "displayText" is the visual version  }));
  // if (req.body.message === undefined) {
  //   // This is an error case, as "message" is required.
  //   res.status(400).send('No message defined!');
  // } else {
  //   // Everything is okay.
  //   console.log(req.body.message);
  //   res.status(200).send('Success: ' + req.body.message);
  // }
  //let cityName = req.body.result.parameters['movie'];
  //console.log(req.body);

  let cityName = req.body.result.parameters.city;
  console.log(cityName);
  
  if (cityName === undefined){
    return res.json({
      speech: 'City Name Var Empty',
      displayText: 'City Name Var Empty'
    });
  } else{
        //callMoviewAPI(cityName).then((output) => {
        // Make the HTTP request
        // http.get(path, responseFromAPI => {
        //     responseFromAPI.setEncoding("utf8");
        //     let body = '';
        //     responseFromAPI.on('data', data => {body += data});
        //     responseFromAPI.on("end", () =>{
        //         let movie = JSON.parse(body)
        //         //let output = cityName === 'The Godfather' ? 'I don\'t have the required info on that. Here\'s some info on \'The Godfather\' instead.\n' : '';
        //         output += movie.name + ' is a ' + movie.stars + ' starer ' + movie.genre + ' movie, released in ' + movie.year + '. It was directed by ' + movie.director;
        //         console.log(output);
        //         resolve(output); 
        //     });
        //     responseFromAPI.on('error', (error) => {
        //         console.log(err);
        //         res.setHeader('Content-Type', 'application/json');
        //         res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
        //     })
        //     res.setHeader('Content-Type', 'application/json');
        //     res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
        // });
        //let path = encodeURI(host + '/v1/public/yql?q=select%20wind%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text="' + encodeURIComponent(cityName)+'"&format=json');
        let path = host + '/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + cityName +'") and u="c"&format=json';
        console.log(path);
        try{
        http.get(path, (responseFromAPI) => {
            responseFromAPI.on('data', function (chunk) {
                let weather_info = JSON.parse(chunk)['query'];
                //let weather_info = JSON.parse(chunk)['query']['results']['channel']['item']['condition'];
                console.log(weather_info.results.channel.item.condition.temp);
                //console.log(weather_info.results.channel.item.forecast[0].text);
                if(weather_info === undefined){
                    console.log("weather_info is empty");
                }else{
                    //console.log(weather_info);
                    //console.log(weather_info.temp);
                    let dataToSend = 'Today the temperature in ' + cityName + ' is ' + weather_info.results.channel.item.condition.temp + '°C, it will be ' + weather_info.results.channel.item.condition.text +' ';
                    dataToSend += '\nForecast for next 7 days:'
                    for (var i = 1; i <= 7; i++){
                        dataToSend += '\n' + weather_info.results.channel.item.forecast[i].day + ' - ' + weather_info.results.channel.item.forecast[i].text + '. High: ' + weather_info.results.channel.item.forecast[i].high + '°C' + ' Low: ' + weather_info.results.channel.item.forecast[i].low + '°C';
                    }
                    console.log(dataToSend);
                    return res.json({
                        speech: dataToSend,
                        displayText: dataToSend,
                        source: 'get-movie-details'
                    });
                }
    
            });
        }, (error) => {
            return res.json({
                speech: 'Something went wrong!',
                displayText: 'Something went wrong!',
                source: 'get-movie-details'
            });
        });
    } catch(e){
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'get-movie-details'
        });
    }
        //res.setHeader('Content-Type', 'application/json');
        //res.send(JSON.stringify({ 'speech': cityName, 'displayText': cityName }));
    }
//};
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});