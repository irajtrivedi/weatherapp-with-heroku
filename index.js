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
        })
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
        })
    }, (error) => {
        dataToSend = 'Sorry! Weather not found for ' + cityName;
        callback(dataToSend);
    });
}

function fetch_book_details(bookType, callback) {
    let path = book_host + '/svc/books/v3/lists/overview.json?api-key=<YOUR_KEY_HERE>';
    let dataToSend = '';
    let book_info = '';
    let flag;
    if (bookType === undefined) {
        dataToSend = "Great to hear that! What would you like to read? Fiction, Non-fiction, Sports, Fitness, Childrens's Picture Book, Business or Science? Write down the genre to see best-seller list";
        callback(dataToSend);
    }
    else {
        //Fetching data from NYTimes best-seller list
        http.get(path, responseFromAPI => {
            responseFromAPI.on('data', function (chunk) {
                if (chunk != undefined) {
                    book_info += chunk;
                }
            })
            responseFromAPI.on('end', function () {
                book_info = JSON.parse(book_info);
                if (book_info === undefined || book_info.status != 'OK' || book_info == '') {
                    dataToSend = "Sorry! couldn't fetch books list";
                    callback(dataToSend);
                } else {
                    dataToSend = "Here's the list of Top 5 " + bookType.toUpperCase() + ' books for you:';
                    if (bookType.toLowerCase() == 'fiction')
                        flag = 0;
                    else if (bookType.toLowerCase() == 'non-fiction' || bookType.toLowerCase() == 'nonfiction')
                        flag = 1;
                    else if (bookType.toLowerCase() == 'sports' || bookType.toLowerCase() == 'fitness')
                        flag = 15;
                    else if (bookType.toLowerCase() == 'pictures book' || bookType.toLowerCase() == 'childrens book' || bookType.toLowerCase() == "children's book")
                        flag = 8;
                    else if (bookType.toLowerCase() == 'business' || bookType.toLowerCase() == 'corporate')
                        flag = 13;
                    else if (bookType.toLowerCase() == 'science' || bookType.toLowerCase() == 'maths')
                        flag = 14;
                    for (var i = 0; i <= 4; i++) {
                        dataToSend += "\n" + (i + 1) + ". " + book_info.results.lists[flag].books[i].title + ' by ' + book_info.results.lists[flag].books[i].author;
                    }
                    callback(dataToSend);
                }
            })
        }, (error) => {
            dataToSend = "Sorry! couldn't fetch books list" + cityName;
            callback(dataToSend);
        });
    }
}

function fetch_book_reviews(bookName, callback) {
    let path = book_host + '/svc/books/v3/reviews.json?api-key=7dfc493d35bd4c87aff6f67a60e24b8c&title=' + bookName.toLowerCase();
    let dataToSend = '';
    let book_info = '';
    //Fetching data from NYTimes best-seller list
    http.get(path, responseFromAPI => {
        responseFromAPI.on('data', function (chunk) {
            if (chunk != undefined) {
                book_info += chunk;
            }
        })
        responseFromAPI.on('end', function () {
            book_info = JSON.parse(book_info);
            if (book_info === undefined || book_info.status != 'OK' || book_info == '' || book_info.num_results == 0) {
                dataToSend = "Sorry! couldn't find the review for "+ bookName +". Could you be more specific?\nExample: 'reviews for Steve Jobs' or 'reviews for Angels and Demons'?";
                callback(dataToSend);
            } else {
                dataToSend = "Below is the summmary for " +  book_info.results[0].book_title + ' wriiten by ' + book_info.results[0].book_author + " and reviewed by " + book_info.results[0].byline;
                dataToSend += "\n" + book_info.results[0].summary;
                dataToSend += "\n\nFor more please click on the below link:";
                dataToSend += "\n" + book_info.results[0].url;
                callback(dataToSend);
            }
        })
    }, (error) => {
        dataToSend = "Sorry! couldn't fetch books list" + cityName;
        callback(dataToSend);
    });
}

server.post('/get-details', function (req, res) {
    let cityName = req.body.result.parameters.city;
    let bookType = req.body.result.parameters.bookType;
    let bookFlag = req.body.result.parameters.book;
    let bookName = req.body.result.parameters.bookName;

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
    } else if (bookFlag != undefined && bookType != undefined && (bookName === undefined || bookName == '')) {
        if (bookType === undefined || bookType == '' && (bookFlag.toLowerCase() == "books" || bookFlag.toLowerCase() == "book" || bookFlag.toLowerCase() == "novel" || bookFlag.toLowerCase() == "novels")) {
            fetch_book_details(undefined, function (result) {
                if (result !== undefined) {
                    return res.json({
                        speech: result,
                        displayText: result
                    });
                }
            });
        } else {
            fetch_book_details(bookType.toLowerCase(), function (result) {
                if (result !== undefined) {
                    return res.json({
                        speech: result,
                        displayText: result
                    });
                }
            });
        }
    } else if (bookName != undefined && bookName != '') {
        fetch_book_reviews(bookName, function (result) {
            if (result !== undefined) {
                return res.json({
                    speech: result,
                    displayText: result
                });
            }
        });
    }
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});
