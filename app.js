var path = require('path');

console.log("Opening database...");
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('db/fun.sqlite3',
                              sqlite3.OPEN_READONLY);

console.log("Initializing static content...");
var modStatics = require('./lib/statics.js');
var statics = new modStatics()
        .on(path.resolve('static/'));

console.log("Initializing rounds...");
var modRounds = require('./lib/rounds.js');
var rounds = new modRounds(db, [
    {'description': 'Get the ID and title of all books in the database, sorted by title from A to Z.',
     'requirement': 'SELECT id, title FROM book ORDER BY title ASC'},
    {'description': 'For all books in the database, get the title (aliased to "bookTitle") and the author (aliased to "bookAuthor"), sorted by author name from Z to A.',
     'requirement': 'SELECT book.title AS bookTitle, author.name AS bookAuthor FROM book INNER JOIN book_author on book.id = book_author.book_id INNER JOIN author ON book_author.author_id = author.id ORDER BY author.name DESC'},
    {'description': 'For all books in the database, get the title (aliased to "bookTitle") and the author (aliased to "bookAuthor"), sorted by book title, from A to Z, <b>ignoring a leading "The" if one exists</b>.',
     'requirement': 'SELECT book.title AS bookTitle, author.name AS bookAuthor FROM book INNER JOIN book_author on book.id = book_author.book_id INNER JOIN author ON book_author.author_id = author.id ORDER BY REPLACE(book.title, "The ", "") ASC'},
    {'description': 'Get the author\'s name, and the count of books listed (aliased to "bookCount"), for each author in the database, including authors for which no books are listed, and sorted by book count, ascending, and then author name, from Z to A.',
     'requirement': 'SELECT author.name, COUNT(book_id) AS bookCount FROM author LEFT JOIN book_author ON author.id = book_author.author_id GROUP BY author.id ORDER BY bookCount ASC, author.name DESC'},
    {'description': 'For each author, get the author\'s name (alised to "author"), and a list of all of that author\'s titles, aliased to "titles" and with each pair of names separated by the string ", " (comma, then space). Order the results by the author\'s name, from A to Z.',
     'requirement': 'SELECT author.name AS author, GROUP_CONCAT(book.title, \', \') AS titles FROM book INNER JOIN book_author on book.id = book_author.book_id INNER JOIN author ON book_author.author_id = author.id GROUP BY author.id ORDER BY author.name ASC'}
]);

var express = require('express');
var app = express();

// Create routes for known static items.
(function() {
    var paths = statics.getPaths();
    for (var i in paths) {
        var path = paths[i];
        var url = path.replace(statics.root(), '');
        app.get(url, function(req, res) {
            var path = statics.root() + req.route.path;
            path = path.replace(/\/\//g, '/');
            res.setHeader('Content-Type', statics.getType(path));
            res.end(statics.getContent(path));
        });
    };
})();

// Create a route for the root path, pointing to /index.html.
app.get('/', function(req, res) {
    var path = statics.root() + '/index.html';
    res.setHeader('Content-Type', statics.getType(path));
    res.end(statics.getContent(path));
});

// Create a route for getting the round count.
app.get('/rounds/count', function(req, res) {
    res.setHeader('Content-Type: application/json');
    res.end(JSON.stringify({'count': rounds.getRoundCount()}));
});

// Create a route for getting a round's description.
app.get('/round/:round/description', function(req, res) {
    res.setHeader('Content-Type: application/json');
    res.end(JSON.stringify({'description':
                            rounds.getRoundDesc(req.route.params.round)}));
});

// Create a route for testing round success or failure.
app.get('/round/:round/try/:query', function(req, res) {
    tryQuery(req.route.params.query,
             function(query, errors, rows) {
                 var status = rounds.try(req.route.params.round,
                                         JSON.stringify(rows));
                 res.setHeader('Content-Type: application/json');
                 res.end(JSON.stringify({'query':  query,
                                         'errors': errors,
                                         'status': status,
                                         'result': rows}));
             });
});

// Run a database query, and get an array of its results.
function tryQuery(query, callback) {
    var rows = [];
    var errs = [];

    query = query.replace(/\;.*$/, ';');
    console.log("Trying " + query);
    
    db.each(query,
            function(err, row) {
                if (err) {
                    errs.push(err.toString());
                }
                else {
                    rows.push(row);
                };
            },
            function(err, cnt) {
                if (err) {
                    errs.push(err.toString());
                };
                errs = errs.map(function(s) {
                    return s.replace(/^Error: .*?: /, '');
                });
                callback(query, errs, rows);
            });
};

// Start the app.
rounds.init(function() {
    app.listen(8018);
    console.log("Listening on :8018");
});
