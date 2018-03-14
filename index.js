/**
 * Developed by Raj Trivedi on 12-03-2018
**/
const express = require('express');
const bodyParser = require('body-parser');
const http = require('https');
const weather_host = 'https://query.yahooapis.com';

const server = express();
server.use(bodyParser.json());

function fetch_weather_info(cityName, callback) {
    let path = weather_host + '/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + cityName + '") and u="c"&format=json';
    let dataToSend = '';
    let weather_info = '';
    //console.log(path);
    http.get(path, responseFromAPI => {
        responseFromAPI.on('data', function (chunk) {
            if(chunk != undefined){
                weather_info = JSON.parse(chunk)['query'];
            }
            if (weather_info === undefined || weather_info.count == 0 || weather_info == '') {
                dataToSend = 'Sorry! Weather not found for ' + cityName;
                //console.log("Reached in if");
                //console.log(weather_info.results.channel.item.condition.temp);
                callback(dataToSend);
            }
            else {
                dataToSend = 'Today the temperature in ' + cityName + ' is ' + weather_info.results.channel.item.condition.temp + '°C, it will be ' + weather_info.results.channel.item.condition.text + '.';
                dataToSend += ' Tomorrow it will be ' + weather_info.results.channel.item.forecast[1].text + ',';
                dataToSend += ' high: ' + weather_info.results.channel.item.forecast[1].high + '°C';
                dataToSend += ' and low: ' + weather_info.results.channel.item.forecast[1].low + '°C.';
                //console.log("Reached in Else");
                callback(dataToSend);
            }
        });
    }, (error) => {
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'get-movie-details'
        });
    });
}

server.post('/get-details', function (req, res) {
    let cityName = req.body.result.parameters.city;
    let bookName = req.body.result.parameters.book;

    if (cityName === undefined && bookName === undefined) {
        return res.json({
            speech: 'Sorry! Please try again',
            displayText: 'Sorry! Please try again'
        });
    } else if (cityName != undefined) {
        fetch_weather_info(cityName, function (result) {
            if (result !== undefined) {
                return res.json({
                    speech: result,
                    displayText: result
                });
            }
            else{
                fetch_weather_info(cityName, function (result) {
                    if (result !== undefined) {
                        return res.json({
                            speech: result,
                            displayText: result
                        });
                    }
                });
            }
        });
    }
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});