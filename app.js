var path = require('path');

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('db/fun.sqlite3',
                              sqlite3.OPEN_READONLY);

var modStatics = require('./lib/statics.js');
var statics = new modStatics()
        .on(path.resolve('static/'));

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

// Create a route for database queries.
app.get('/query/:query', function(req, res) {
    tryQuery(req.route.params.query,
             function(q, e, r) {
                 res.setHeader('Content-Type', 'application/json');
                 res.end(JSON.stringify({'query':  q,
                                         'errors': e,
                                         'status': (e.length == 0),
                                         'result': r}));
             });
});

function tryQuery(query, callback) {
    var rows = [];
    var errs = [];

    query = query.replace(/\;.*$/, ';');
    
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
app.listen(8018);
console.log("Listening on :8018");
