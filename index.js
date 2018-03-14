/**
 * Developed by Raj Trivedi on 12-03-2018
**/
const express = require('express');
const bodyParser = require('body-parser');
const http = require('https');
const weather_host = 'https://query.yahooapis.com';
const book_host = 'https://api.nytimes.com';

const server = express();
server.use(bodyParser.json());

function fetch_weather_info(cityName, callback) {
    let path = weather_host + '/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + cityName + '") and u="c"&format=json';
    let dataToSend = '';
    let weather_info = '';
    http.get(path, function (responseFromAPI) {
        responseFromAPI.on('data', function (chunk) {
            if (chunk != undefined) {
                weather_info += chunk;
            }
        });
        responseFromAPI.on('end', function () {
            weather_info = JSON.parse(weather_info)['query'];
            if (weather_info === undefined || weather_info.count == 0 || weather_info == '') {
                dataToSend = 'Sorry! Weather not found for ' + cityName;
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
        dataToSend = 'Sorry! Weather not found for ' + cityName;
        callback(dataToSend);
    });
}

function fetch_book_details(bookType, callback) {
    let path = book_host + '/svc/books/v3/lists/overview.json?api-key=7dfc493d35bd4c87aff6f67a60e24b8c';
    let dataToSend = '';
    let book_info = '';
    let flag;
    http.get(path, function (responseFromAPI) {
        responseFromAPI.on('data', function (chunk) {
            if (chunk != undefined) {
                book_info += chunk;
            }
        });
        responseFromAPI.on('end', function () {
            book_info = JSON.parse(book_info);
            if (book_info === undefined || book_info.status != 'OK' || book_info == '') {
                dataToSend = "Sorry! couldn't fetch books list";
                callback(dataToSend);
            }
            else {
                if (bookType === undefined) {
                    dataToSend = "Great! what would you like to read? Fiction, Non-fiction, Sports, Fitness, Childrens's Picture Book, Business, Science";
                    // for (var i = 0; i <= 15; i++) {
                    //     dataToSend += "\n" + book_info.results.lists[i].display_name;
                    callback(dataToSend);
                    // }
                    //console.log(dataToSend);
                } else {
                    dataToSend = "Here's the list of Top 5 " + bookType.toUpperCase() + ' books for you:';
                    if (bookType == 'fiction')
                        flag = 0;
                    else if (bookType.toLowerCase() == 'non-fiction' || bookType.toLowerCase() == 'nonfiction')
                        flag = 1;
                    for (var i = 0; i <= 4; i++) {
                        dataToSend += "\n" + (i + 1) + ". " + book_info.results.lists[flag].books[i].title + ' by ' + book_info.results.lists[flag].books[i].author;
                    }
                    callback(dataToSend);
                }
            }
        });
    }, (error) => {
        dataToSend = 'Sorry! Weather not found for ' + cityName;
        callback(dataToSend);
    });
}

server.post('/get-details', function (req, res) {
    let cityName = req.body.result.parameters.city;
    let bookType = req.body.result.parameters.book;

    if (cityName === undefined && bookType === undefined) {
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
        });
    } else if (bookType != undefined) {
        if (bookType.toLowerCase() == "books" || bookType.toLowerCase() == "book" || bookType.toLowerCase() == "novel" || bookType.toLowerCase() == "novels") {
            fetch_book_details(undefined, function (result) {
                if (result !== undefined) {
                    return res.json({
                        speech: result,
                        displayText: result
                    });
                }
            });
        }
        else {
            fetch_book_details(bookType.toLowerCase(), function (result) {
                if (result !== undefined) {
                    return res.json({
                        speech: result,
                        displayText: result
                    });
                }
            });
        }
    }
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});