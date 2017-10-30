/*
    Got an idea from http://blog.benoitvallon.com/data-structures-in-javascript/the-graph-data-structure/

    This is a graph class that represents movie and actor relation.
    It uses data collected from Scrape.js.
 */
//initial setting for logger
var log4js = require('log4js');
log4js.configure({
    appenders: { graph: { type: 'file', filename: 'graph.log' } },
    categories: { default: { appenders: ['graph'], level: 'debug' } }
});
var logger = log4js.getLogger('graph');

//load data from json file.
var fs = require("fs");
var actors = fs.readFileSync("actors.json", "utf8");
var movies = fs.readFileSync("movies.json", "utf8");

//JSON object for movie and actor
var jsonMovies = JSON.parse(movies);
var jsonActors = JSON.parse(actors);

//Graph constructor
function Graph() {
    this.vertices = [];
    this.edges = [];
    this.weight = [];
};

/*
    it reads json file and convert it into Json object.
 */
Graph.prototype.readFile = function (actorFilePath, movieFilePath){
    movies = fs.readFileSync(movieFilePath, "utf8");
    actors = fs.readFileSync(actorFilePath, "utf8");
    jsonMovies = JSON.parse(movies);
    jsonActors = JSON.parse(actors);

    logger.info("Successfully constructed a graph");
};

/*
    add a vertex into a graph.
    vertex: a vertex to be added into a graph.
 */
Graph.prototype.addVertex = function (vertex) {
    logger.info("addVertex was called: " + vertex);
    if (!this.containVertex(vertex)) {
        this.vertices.push(vertex);
        this.edges[vertex] = [];
    }
};

/*
    remove a vertex from a graph.
    vertex: a vertex to be added into a graph.
 */
Graph.prototype.removeVertex = function (vertex) {
    logger.info("removeVertex was called: " + vertex);
    this.vertices = this.vertices.filter (function(item){
        return item !== vertex;
    })
};

/*
    check if a graph contains the given vertex
    returns TRUE if it contains. FALSE otherwise.
 */
Graph.prototype.containVertex = function (vertex) {
    logger.info("containVertex was called: " + vertex);
    for (var x = 0; x < this.vertices.length; x ++) {
        if (this.vertices[x] === vertex) {
            return true;
        }
    }
    return false;
};

/*
    add edge between two vertices.
 */
Graph.prototype.addEdge = function (vertex1, vertex2) {
    logger.info("addEdge was called: " + vertex1 + ", " + vertex2);
    this.edges[vertex1].push(vertex2);
    this.edges[vertex2].push(vertex1);
};

/*
    set weight between two vertices.
 */
Graph.prototype.setWeight = function (vertex1, vertex2, weight) {
    logger.info("setWeight was called: " + vertex1 + ", " + vertex2 + ", weight : " + weight);
    this.weight[[vertex1, vertex2]] = weight;
    this.weight[[vertex2, vertex1]] = weight;
};

/*
    Returns weight of two vertices.
 */
Graph.prototype.getWeight = function (vertex1, vertex2) {
    logger.info("getWeight was called: " + vertex1 + ", " + vertex2);
    return this.weight[[vertex1, vertex2]];
}

/*
    Find a actor from jsonActor list
    actor: object to be found in the list.
 */
function findActor (actor) {
    for (var i = 0; i < jsonActors.length; i++){
        var act = jsonActors[i].actors;
        if (actor === act.name) {
            return act;
        }
    }
    return null;
}

/*
    Find a movie from jsonMovie list
    movie: object to be found in the list.
 */
function findMovie (movie){
    for (var i = 0; i < jsonMovies.length; i++){
        var movie = jsonMovies[i].movies;
        if (movies === movie.title) {
            return movie;
        }
    }
    return null;
}

/*
    This method creates a graph using objects in jsonMovie and jsonActor
 */
Graph.prototype.createGraph = function () {
    logger.trace("Entering createGraph");
    var found = false;
    for (var i = 0; i < jsonMovies.length; i ++){
        for (var j = 0; j < jsonMovies[i].actors.length; j++) {
            var actor = findActor(jsonMovies[i].actors[j]);
            if (actor !== null) {
                if (found === false) {
                    this.addVertex(JSON.stringify(jsonMovies[i].movies));
                    found = true;
                }
                this.addVertex(JSON.stringify(actor));
                this.addEdge(JSON.stringify(jsonMovies[i].movies), JSON.stringify(actor));
                this.setWeight(JSON.stringify(jsonMovies[i].movies), JSON.stringify(actor), j);
            }
        }
        found = false;
    }

    for (var x = 0; x < jsonActors.length; x++){
        for (var y = 0; y < jsonActors[x].movies.length; y++){
            var movie = findMovie(jsonActors[x].movies[y]);
            if ((movie !== null)){
                if (found === false){
                    this.addVertex(JSON.stringify(movie));
                }
                found = true;
                this.addEdge(JSON.stringify(jsonActors[x].actors), JSON.stringify(movie));
                this.setWeight(JSON.stringify(jsonActors[x].actors), JSON.stringify(movie), y);
            }
        }
        found = false;
    }
};

/*
    Find how much a movie has grossed
    returns list of which movies an actor has worked in
    movieTitle: movie to be found
 */
Graph.prototype.getMovieGross = function (movieTitle){
    logger.trace("Entering getMovieGross");
    var startVertex = this.vertices[0];
    var visited_vertex = [];
    return this.getMovieHelper(movieTitle, visited_vertex, startVertex );
};

/*
    Helper function for getMovieGross. Uses DFS traversal.
 */
Graph.prototype.getMovieHelper = function (movieTitle, visited_vertex, startVertex){
    logger.trace("Entering getMovieHelper");
    if (startVertex.includes(movieTitle)) {
        var jsonObj = JSON.parse(startVertex);
        if (jsonObj.title !== undefined && jsonObj.title.includes(movieTitle)) {
            if (jsonObj.gross === "") {
                jsonObj.gross = "No information about gross";
            }
            return jsonObj.gross;
        }
    }

    var adjVertices = this.edges[startVertex];
    visited_vertex[startVertex] = "visited";
    for (var i = 0 ; i < adjVertices.length; i ++){
        if (visited_vertex[adjVertices[i]] === undefined) {
            var val = this.getMovieHelper(movieTitle, visited_vertex, adjVertices[i]);
            if (val !== undefined){
                return val;
            }
        }
    }
};

/*
    return list of which movies an actor has worked in
    Uses DFS traversal to find the movie.
 */
Graph.prototype.getMoviesByActor = function (actorName){
    logger.trace("Entering getMoviesByActor");
    var startVertex = this.vertices[0];
    var visited_vertex = [];
    var movies = this.getMoviesByActorHelper(actorName, visited_vertex, startVertex );
    if (movies !== undefined) {
        var s = "";
        for (var i = 0; i < movies.length-1; i++){
            var temp = JSON.parse(movies[i]);
            s += temp.title + ", ";
        }
        s += JSON.parse(movies[movies.length-1]).title;
        return s;
    }
    return movies;
};

var count = 0;

Graph.prototype.getMoviesByActorHelper = function (actorName, visited_vertex, startVertex){
    logger.trace("Entering getMoviesByActorHelper");
    if (startVertex.includes(actorName)) {
        var jsonObj = JSON.parse(startVertex);
        if (jsonObj.name !== undefined && jsonObj.name.includes(actorName)) {
            var movies = this.edges[JSON.stringify(jsonObj)];
            if (movies.length ===0 ){
                movies.push("No information about movies");
            }
            return movies;
        }
    }
    var adjVertices = this.edges[startVertex];
    visited_vertex[startVertex] = "visited";
    for (var i = 0 ; i < adjVertices.length; i ++){
        if (visited_vertex[adjVertices[i]] === undefined) {
            var val = this.getMoviesByActorHelper(actorName, visited_vertex, adjVertices[i]);
            count ++;
            if (val !== undefined){
                return val;
            }
        }
    }
};

/*
    return list of which actors worked in a movie
    Uses DFS traversal to find the actors.
 */
Graph.prototype.getActorsByMovie = function (movieName){
    logger.trace("Entering getActorsByMovie");
    var startVertex = this.vertices[0];
    var visited_vertex = [];
    var actors = this.getActorsByMovieHelper(movieName, visited_vertex, startVertex );
    if (actors !== undefined) {
        var s = "";
        for (var i = 0; i < actors.length-1; i++){
            var temp = JSON.parse(actors[i]);
            s += temp.name + ", ";
        }
        s += JSON.parse(actors[actors.length-1]).name;
        return s;
    }
    return actors;
};


Graph.prototype.getActorsByMovieHelper = function (movieName, visited_vertex, startVertex){
    logger.trace("Entering getActorsByMovieHelper");
    if (startVertex.includes(movieName)) {
        var jsonObj = JSON.parse(startVertex);
        if (jsonObj.title !== undefined && jsonObj.title.includes(movieName)) {
            var actors = this.edges[JSON.stringify(jsonObj)];
            if (actors.length ===0 ){
                actors.push("No information about movies");
            }
            return actors;
        }
    }
    var adjVertices = this.edges[startVertex];
    visited_vertex[startVertex] = "visited";
    for (var i = 0 ; i < adjVertices.length; i ++){
        if (visited_vertex[adjVertices[i]] === undefined) {
            var val = this.getActorsByMovieHelper(movieName, visited_vertex, adjVertices[i]);
            count ++;
            if (val !== undefined){
                return val;
            }
        }
    }
};
/*
    helper function for getActorsWithTopGrossing method
    It takes a string and parse it into integer.
 */
function grossStrToNum (string) {

    var result = -1;
    if ((string === null) || (string === undefined)){
        return -1;
    }
    //case $
    if (string.charAt(0) === '$'){
        string = string.substring(1);
    }
    //remove ,
    string = string.replace(/,/g, '');
    //case million
    if (string.includes("million")){
        result = parseInt(string);
        result = result*1000000;
        return result;
    }
    result = parseInt(string);
    return result;
};

/*
    return list of the top X actors with the most total grossing value
    Use BFS
 */
Graph.prototype.getActorsWithTopGrossing = function (){
    logger.trace("Entering getActorsWithTopGrossing");
    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var curVertex;
    var maxVertex = '{ "title": "beginner", "date": "", "gross" : "$100" }';

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        if ((curObj !== undefined) && (curObj.gross !== undefined)){
            var maxObj = JSON.parse(maxVertex);
            if (grossStrToNum(curObj.gross) > grossStrToNum(maxObj.gross)){
                maxVertex = curVertex;
            }
        }
    }

    var actors = this.edges[maxVertex];
    if (actors !== undefined) {
        var s = "";
        for (var i = 0; i < actors.length-1; i++){
            var temp = JSON.parse(actors[i]);
            s += temp.name + ", ";
        }
        s += JSON.parse(actors[actors.length-1]).name;
        return s;
    }

    return "No information found";

};

/*
    helper method for getOldestActors
    takes a string and convert it into integer
 */
function getAge (year){
    return parseInt(year.substring(0,4));
};


/*
    return list of all the movies for a given year
 */
Graph.prototype.getMovieByYear = function (year){
    logger.trace("Entering getMovieByYear");
    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var curVertex;
    var maxVertex = [];

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        if ((curObj !== undefined) && (curObj.date !== undefined)){
            //here
            if ((curObj.date).includes(year)){
                maxVertex.push(curVertex);
            }
        }
    }
    return maxVertex;
};

/*
    Extracted method for functions using BFS
 */
function addQueue(curVertex, queue, visited_vertex) {
    curVertex = queue.shift();
    visited_vertex[curVertex] = "visited"
    var adjVertices = this.edges[curVertex];

    for (var i = 0; i < adjVertices.length; i++) {
        if (visited_vertex[adjVertices[i]] === undefined) {
        	visited_vertex[adjVertices[i]] = "visited"
            queue.push(adjVertices[i]);
        }
    }
    return {curVertex: curVertex, adjVertices: adjVertices, i: i};
}

/*
    List all the actors for a given year
 */
Graph.prototype.getActorsByYear = function (year){
    logger.trace("Entering getActorsByYear");
    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var curVertex;
    var maxVertex = [];

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        if ((curObj !== undefined) && (curObj.birth !== undefined)){
            if ((curObj.birth).includes(year)){
                maxVertex.push(curVertex);
            }
        }
    }
    return maxVertex;
};

/*
    List the oldest X actors
 */
Graph.prototype.getOldestActors = function (){
    logger.trace("Entering getOldestActors");
    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var curVertex;
    var maxVertex = ['{"name":"beginner","birth":"2017"}'];

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        if ((curObj !== undefined) && (curObj.birth !== undefined)){
            var maxObj = JSON.parse(maxVertex[0]);
            if (getAge(curObj.birth) < getAge(maxObj.birth)){
                maxVertex = [];
                maxVertex.push(curVertex);
            }
            else if (getAge(curObj.birth) === getAge(maxObj.birth)){
                maxVertex.push(curVertex);
            }
        }
    }

    var s = "";
    for (var i = 0 ; i < maxVertex.length-1; i++){
        var actor = JSON.parse(maxVertex[i]);
        if (actor !== undefined){
            s += actor.name + ",";
        }
    }
    s += (JSON.parse(maxVertex[maxVertex.length-1])).name;

    return s;
};

module.exports = Graph;

var g = new Graph();
g.createGraph();
console.log(g);
console.log(g.getOldestActors());


