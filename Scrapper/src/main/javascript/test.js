Graph = require("./../../main/javascript/Graph.js");
var assert = require('assert');

describe ('graphConstructorTest',function(){
    describe ('constructor', function(){
        var graph = new Graph();
        it ('vertices.length should return 0 when a graph is constructed', function(){
            assert.equal(0, graph.vertices.length);
        });
        it ('edges.length should return 0 when a graph is constructed', function(){
            assert.equal(0, graph.edges.length);
        });
        it ('weight.length should return 0 when a graph is constructed', function(){
            assert.equal(0, graph.weight.length);
        });
    });

    describe ('addVertex', function(){
        var graph = new Graph();
        it ('length of vertices increase by 1 when a vertex is inserted', function(){
            graph.addVertex("V1");
            assert.equal(1, graph.vertices.length);
        });
        it ('value of inserted vertex is V1', function(){
            assert.equal("V1", graph.vertices[0]);
        });

        it ('inserting duplicate vertex does not do anything', function(){
            graph.addVertex("V1");
            assert.equal(1, graph.vertices.length);
        });
    });

    describe ('removeVertex', function(){
        var graph = new Graph();
        graph.addVertex("V1");
        graph.addVertex("V2");
        it ('removes vertex from vertices', function(){
            graph.removeVertex("V1");
            assert.equal(1, graph.vertices.length);
        });
        it ('removes non-exist vertex from vertices does not do anything', function(){
            graph.removeVertex("V1");
            assert.equal(1, graph.vertices.length);
            assert.equal("V2", graph.vertices[0]);
        });
    });

    describe ('containVertex', function(){
        var graph = new Graph();
        graph.addVertex("V1");
        graph.addVertex("V2");
        it ('return true if a graph contain a given vertex', function(){
            assert.equal(true, graph.containVertex("V1"));
        });

        it ('return false if a graph does not contain a give vertex', function(){
            assert.equal(false, graph.containVertex("V3"));
        });
    });

    describe ('addEdge', function(){
        var graph = new Graph();
        graph.addVertex("V1");
        graph.addVertex("V2");
        graph.addEdge("V1", "V2");
        it ('adding edge maps two vertices each other', function(){
            assert.equal("V1", graph.edges["V2"]);
            assert.equal("V2", graph.edges["V1"]);
        });
    });

    describe ('setWeight', function(){
        var graph = new Graph();
        graph.addVertex("V1");
        graph.addVertex("V2");
        graph.addEdge("V1", "V2");
        graph.setWeight("V1", "V2", 3);
        it ('set weight between two vertices and getWeight returns the weight', function(){
            assert.equal(3, graph.getWeight("V1", "V2"));
            assert.equal(3, graph.getWeight("V2", "V1"));
        });
    });

    describe ('readFile/createGraph', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns information about an actor', function(){
            assert.equal(true, graph.vertices.length === 4);
        });
    });

    describe ('getMovieGross', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns amount of gross of the movie', function(){
            assert.equal(true, graph.getMovieGross("Brubaker") === "$37,121,708");
        });
    });

    describe ('getMoviesByActor', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns movies associated with the actor', function(){
            assert.equal(true, graph.getMoviesByActor("Yaphet Kotto") === "Brubaker");
        });
    });

    describe ('getActorsByMovie', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns actors associated with the movie', function(){
            assert.equal(true, graph.getActorsByMovie("Brubaker") === "Yaphet Kotto, Murray Hamilton, Morgan Freeman");
        });
    });

    describe ('getActorsWithTopGrossing', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns actors associated with the top grossing movie', function(){
            assert.equal(true, graph.getActorsWithTopGrossing() === "Yaphet Kotto, Murray Hamilton, Morgan Freeman");
        });
    });

    describe ('getOldestActors', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns oldest actor', function(){
            assert.equal(true, graph.getOldestActors() === "Murray Hamilton");
        });
    });

    describe ('getMovieByYear', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns movies associated with the year', function(){
            assert.equal(true, JSON.stringify(graph.getMovieByYear("1980")) === '["{\\"title\\":\\"Brubaker\\",\\"date\\":\\"\\\\n\\\\n\\\\nJune 20, 1980 (1980-06-20)\\\\n\\\\n\\\\n\\\\n\\\\n\\\\n\\\\n\\",\\"gross\\":\\"$37,121,708\\"}"]');
        });
    });

    describe ('getActorsByYear', function(){
        var graph = new Graph();
        graph.readFile("actors_test.json", "movies_test.json");
        graph.createGraph();
        it ('returns actors associated with the year', function(){
            assert.equal(true, JSON.stringify(graph.getActorsByYear("1939")) === '["{\\"name\\":\\"Yaphet Kotto\\",\\"birth\\":\\"1939-11-15\\"}"]');
        });
    });

});

