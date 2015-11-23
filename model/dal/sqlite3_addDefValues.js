/**
 * Created by Jean-Vital on 26/10/2015.
 */

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('serveurs.db');

db.serialize(function() {

    var stmt = db.prepare("INSERT INTO serveurs (author, ip) VALUES (?, ?)");

    stmt.finalize();

    db.each("SELECT author, ip, createTime FROM serveurs", function(err, row) {
        console.log(row.dtc + " - " + row.title + " - " + row.url);
    });
});

db.close();