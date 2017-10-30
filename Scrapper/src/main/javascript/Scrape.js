/*
    Author: SeokHyun Song
    Version: 1.0
    Last Modified Date: 2017-10-09

    This is a javascript that scrape movie and actor information from wikipedia.
    It uses Cheerio, NodeJS, Mocha, Istanbul, and Json
 */

//initial setting for sending request using cheerio and node js
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var app = express();
var url = "https://en.wikipedia.org/wiki/Brubaker"; //"https://en.wikipedia.org/wiki/Christian_Bale";
var port = 8000;

//initial setting for log4js to use logging
var log4js = require('log4js');
log4js.configure({
    appenders: { scrape: { type: 'file', filename: 'scrape.log' } },
    categories: { default: { appenders: ['scrape'], level: 'debug' } }
});
var logger = log4js.getLogger('scrape');

//list of movies and actors objects
var objMovies = [];
var objActors = [];

//number of movie and actor objects
var moviesCount = 0;
var actorsCount = 0;

//list of actor and movie urls
var actorUrls = ["https://en.wikipedia.org/wiki/Morgan_Freeman"];
var movieUrls = ["https://en.wikipedia.org/wiki/Batman_Begins"];

//list of used actor and movie urls.
var pastActorUrls = [];
var pastMovieUrls = [];

//represent which turn it is; movie or actor
var turn = 0;

/*
    find and navigate to data containing a list
    data: starting point
 */
function findData(data) {
    while (data.has("li").length === 0) {
        data = data.next();
    }
    data = data.find("li");
    return data;
};

/*
    write collected data into files
 */
function writeToFile() {
    fs.writeFile('actors.json', JSON.stringify(objActors), function (err) {
        if (err) {
            logger.error("Failed to write:" + err);
            console.log("Failed to write a file");
        }
        else {
            logger.info("Successfully wrote the actors file")
            console.log("Successfully written actors file");
        }
    })
    fs.writeFile('movies.json', JSON.stringify(objMovies), function (err) {
        if (err) {
            logger.error("Failed to write:" + err);
            console.log("Failed to write a file");
        }
        else {
            logger.info("Successfully wrote the movies file")
            console.log("Successfully written movies file");
        }
    })
}

/*
    checks whether a value is contained in the array.
    arr: array to be searched
    val: value to be found
    Return true if found. Otherwise, return false.
 */
function containsTitle (arr, val) {
    logger.trace("Entering containsTitle function");
    if ((val === undefined) || (val === null)) {
        return true;
    }

    for (var i = 0; i < arr.length ; i++) {
        if (arr[i].type === "movie") {
            if (arr[i].movies.title === val) {
                return true;
            }
        }
    }
    return false;
}

/*
    checks whether a value is contained in the array.
    arr: array to be searched
    val: value to be found
    Return true if found. Otherwise, return false.
 */
function containsName (arr, val) {
    logger.trace("Entering containsName function");
    if ((val === undefined) || (val === null)) {
        return true;
    }

    for (var i = 0; i < arr.length ; i++) {
        if (arr[i].type === "actor") {
            if (arr[i].actors.name === val) {
                return true;
            }
        }
    }
    return false;
}

/*
    add url to corresponding url lists.
    href: url to be added
    obj: to check whether the url is actor's url or movie's url
 */
function addUrl(href, obj) {
    logger.trace("Entering addUrl function");
    if (((href !== undefined) && !href.includes("redLink"))) {
        if (href.includes("/wiki")) {
            if (obj.type === "actor") {
                if (movieUrls.length > 300) {
                    return;
                }
                var check = false;
                for (var a = 0; a < pastMovieUrls.length; a++) {
                    if (pastMovieUrls[a] === href) {
                        check = true;
                    }
                }
                if (check === false){
                    movieUrls.push("https://en.wikipedia.org" + href);
                    pastMovieUrls.push(href);
                }
            }
            else {
                if (actorUrls.length > 300) {
                    return;
                }
                var c = false;
                for (var b = 0; b < pastActorUrls.length; b++) {
                    if (pastMovieUrls[b] === href) {
                        c = true;
                    }
                }
                if (c === false){
                    actorUrls.push("https://en.wikipedia.org" + href);
                    pastActorUrls.push(href);
                }
            }
        }
    }
}

/*
    search movie name from parsed html and add it to movie list
    $: parsed object
    obj: object to be added to movie object list
 */
function searchAndAddMovie($, obj) {
    logger.trace("Entering searchAndAddMovie function");
    var data2 = $(this).parent();
    data2 = findData(data2);
    do {
        var title = data2.find("a").attr("title");
        var href = data2.find("a").attr('href');
        addUrl(href, obj);
        if (title !== null && title !== "" && title !== undefined) {
            if (!contains(obj.movies, title)) {
                obj.movies.push(title);
            }
        }
        data2 = data2.next();
    } while (data2.next().length !== 0);
}

/*
    check whether the array contains the value or not
    arr: array to be checked
    val: value to be checked
    Return TRUE if the array contains the value. Otherwise, return false.
 */
function contains(arr, val) {
    for (var i = 0; i < arr.length; i ++) {
        if (arr[i]===val) {
            return true;
        }
    }
    return false;
}

/*
    Request url to server. Main function of Scrape.js
    url: url to send request
    requestHelper: collects all data such as movie url, actor url, movie and actor object information
 */
request(url, function requestHelper(err, respond, html) {
    if (moviesCount > 125 && actorsCount > 250) {
        writeToFile();
        return;
    }

    if (err) {
        console.log(err);
        logger.error("Request was not successful with url: " + url + ", error message :" + err);
    }
    else {
        logger.trace("Request was successful with url:" + url);
        var $ = cheerio.load(html);
        var head;
        $('.firstHeading').filter(function (){
            head = $(this).text();
        });

        //Case of movie
        $(".infobox.vevent").filter(function () {
            logger.trace("Entering case of movie code" + url);
            var obj = {type:"", actors:[], movies:{}};

            if (moviesCount > 125){
                $("#Cast").filter(function () {
                    var data2 = $(this).parent();
                    data2 = findData(data2);
                    do{
                        var href = data2.find("a").attr('href');
                        addUrl(href, obj);
                        data2 = data2.next();
                    }while (data2.next().length !== 0);
                });
                return;
            }

            obj.type = "movie";

            var data = $(this).children().children();
            while(!data.first().text().includes("Starring") && (data.text() !== "")) {
                data = data.next();
            }
            var temp = data.first().children().children();
            do{
                var name = temp.next("a").attr("title");
                var href = temp.next("a").attr('href');
                //console.log(href);
                addUrl(href, obj);
                if(!contains(obj.actors, name)){
                    obj.actors.push(name);
                }
                temp = temp.next().next();
            } while (temp.next().length !== 0);

            while(!data.first().text().includes("Release date") && (data.text() !== "")){
                data = data.next();
            }
            //release date
            var rDate = data.children().first().next().text();

            while(!data.first().text().includes("Box office") && (data.text() !== "")){
                data = data.next();
            }

            //gross amount
            var aGross = data.children().first().next().clone().children().remove().end().text();
            obj.movies = {title: head, date: rDate, gross: aGross};
            //console.log(data.text());

            //find actors

            $("#Cast").filter(function () {
                var data2 = $(this).parent();
                data2 = findData(data2);

                do{
                    var name = data2.find("a").attr("title");
                    var href = data2.find("a").attr('href');
                    //console.log(href);
                    addUrl(href, obj);
                    if(!contains(obj.actors, name)){
                        obj.actors.push(name);
                    }
                    //console.log(name);
                    data2 = data2.next();
                } while (data2.next().length !== 0);
            });
            if (!containsTitle(objMovies, obj.movies.title)) {
                objMovies.push(obj);
                moviesCount++;
            }
        });

        //case of Actor
        $('.infobox.biography.vcard').filter(function () {
            logger.trace("Entering case of actor code" + url);
            var obj = {type:"", actors:{}, movies:[]};
            obj.type = "actor";
            if ((actorsCount > 250)){
                $("#Filmography").filter(function () {
                    var data2 = $(this).parent();
                    data2 = findData(data2);
                    do{
                        var href = data2.find("a").attr('href');
                        addUrl(href, obj);
                        data2 = data2.next();
                    }while (data2.next().length !== 0);
                });
                return;
            }

            var data = $(this).children().children();
            while(!data.first().text().includes("Born") && (data.text() !== "")){
                data = data.next();
            }
            //birthday
            var birthDay = data.children().first().next().find('.bday').text();
            obj.actors = {name: head, birth: birthDay};
            //console.log(obj.actors);

            $("#Filmography").filter(function () {
                searchAndAddMovie.call(this, $, obj);
                $(".wikitable").first().filter(function () {
                    var d = $(this).children().children();
                    do {
                        var title = d.find("a").attr("title");
                        var href = d.find("a").attr('href');
                        addUrl(href, obj);
                        if (title !== null && title !== "" && title !== undefined) {
                            if (!contains(obj.movies, title)) {
                                obj.movies.push(title);
                            }
                        }
                        d = d.next();
                    } while (d.next().length !== 0);
                });
            });

            $("#Selected_filmography").filter(function () {
                searchAndAddMovie.call(this, $, obj);
                $(".wikitable").first().filter(function () {
                    var d = $(this).children().children();
                    do {
                        var title = d.find("a").attr("title");
                        var href = d.find("a").attr('href');
                        addUrl(href, obj);
                        if (title !== null && title !== "" && title !== undefined) {
                            if (!contains(obj.movies, title)) {
                                obj.movies.push(title);
                            }
                        }
                        d = d.next();
                    } while (d.next().length !== 0);
                });
            });

            if (!containsName(objActors, obj.actors.name)) {
                objActors.push(obj);
                actorsCount++;
            }
        });
        logger.info("number of actor succeeded:" + actorsCount);

        logger.info("number of movies succeeded:" + moviesCount);
    }
    if ((turn%4) !== 0){
        if (actorUrls.length === 0) {
            return;
        }
        url = actorUrls.shift();
    }
    else {
        if (movieUrls.length === 0) {
            return;
        }
        url = movieUrls.shift();
    }

    turn = (turn+1) % 4;

    if (moviesCount > 125) {
        turn = 1;
    }
    else if (actorsCount > 250) {
        turn = 4;
    }


    console.log("actor count is: " + actorsCount);
    console.log("movie count is: " + moviesCount);
    console.log("--------------------------");
    request(url, requestHelper);
    //writeToFile();
});

app.listen(port);
console.log('server is listening on ' + port);





