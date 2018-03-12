/**
 * Developed by Raj Trivedi on 12-03-2018
**/
const express = require('express');
const bodyParser = require('body-parser');
const http = require('https');
const weather_host = 'https://query.yahooapis.com';

const server = express();
server.use(bodyParser.json());

server.post('/get-details', function (req, res) {
    let cityName = req.body.result.parameters.city;
    let bookName = req.body.result.parameters.book;

    if (cityName === undefined && bookName === undefined) {
        return res.json({
            speech: 'Sorry! Please try again',
            displayText: 'Sorry! Please try again'
        });
    } else if (cityName != undefined) {
        let dataToSend = fetch_weather_info(cityName);
        return res.json({
            speech: dataToSend,
            displayText: dataToSend
        });
    }
});

function fetch_weather_info(cityName) {
    let path = weather_host + '/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + cityName + '") and u="c"&format=json';
    //console.log(path);
    let dataToSend = '';
    var req = http.request(path, function (responseFromAPI) {
        responseFromAPI.on('data', function (chunk) {
            let weather_info = JSON.parse(chunk)['query'];
            if (weather_info.count == 0) {
                dataToSend = 'Sorry! Weather not found for ' + cityName;
            } else {
                dataToSend = 'Today the temperature in ' + cityName + ' is ' + weather_info.results.channel.item.condition.temp + '°C, it will be ' + weather_info.results.channel.item.condition.text + '.';
                dataToSend += ' Tomorrow it will be ' + weather_info.results.channel.item.forecast[1].text + ',';
                dataToSend += ' high: ' + weather_info.results.channel.item.forecast[1].high + '°C';
                dataToSend += ' and low: ' + weather_info.results.channel.item.forecast[1].low + '°C.';
            }
        });
    });
    req.on('error', function(e){
        console.log('problem with request: ' + e.message);
        dataToSend = 'Sorry! Something went wrong';
    });
    return dataToSend;
}

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});