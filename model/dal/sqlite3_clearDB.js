var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('gags.db');

db.serialize(function() {

});

db.close();
