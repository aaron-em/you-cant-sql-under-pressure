// CREATE TABLE author (id serial, name text);
// CREATE TABLE book (id serial, title text);
// CREATE TABLE book_author (book_id int(11), author_id int(11));

var sqlite3  = require('sqlite3');
var db = new sqlite3.Database("fun.sqlite3");

var tables = ['book', 'author', 'book_author'];

var columns = {'book': ['id', 'title'],
               'author': ['id', 'name'],
               'book_author': ['book_id', 'author_id']};

var records = {
    'book': [[1, 'Gödel, Escher, Bach: An Eternal Golden Braid'],
             [2, 'Surely You\'re Joking, Mr. Feynman!'],
             [3, 'The Moon is a Harsh Mistress'],
             [4, 'The Feynman Lectures on Computation'],
             [5, 'The Cat who Walks through Walls'],
             [6, 'To Sail Beyond the Sunset'],
             [7, 'The Pleasure of Finding Things Out'],
             [8, 'Metamagical Themas']],
    'author': [[1, 'Douglas Hofstadter'],
               [2, 'Richard P. Feynman'],
               [3, 'Robert A. Heinlein']],
    'book_author': [[1, 1],
                    [2, 2],
                    [3, 3],
                    [4, 2],
                    [5, 3],
                    [6, 3],
                    [7, 2],
                    [8, 1]]
};

try {
db.serialize(function() {
    for (var i in tables) {
        var table = tables[i];
        var rows = records[table];
        var cols = columns[table];

        console.log('Deleting from ' + table);
        try {
            db.run('DELETE FROM ' + table);
        }
        catch (er) {
            console.log("Delete failed: " + er);
        };

        var query = 'INSERT INTO ' + table + ' (' + cols.join(', ') + ')'
                + ' VALUES (' + cols.map(function() { return '?'; }).join(', ')
                + ');';
        console.log("Query prototype is " + query);

        for (var j in rows) {
            var row = rows[j];
            console.log('Inserting ' + JSON.stringify(row));
            try {
                db.run(query, row);
            }
            catch (er) {
                console.log("Insert failed: " + er);
            };
        };
    };
});
}
catch (er) {
    console.log("Shit's broke: " + er);
};

console.log("Should be done now, I guess");
