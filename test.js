// Create a database named "mydb":
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root2",
  password: "Qwert@04",
  database:"node_app"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
//   con.query("CREATE TABLE mynodedeletedb (name VARCHAR(255), address VARCHAR(255))", function (err, result) {
  con.query("INSERT INTO mynodedeletedb (name, address) VALUES ('TVM Online','Gidangal')", function (err, result) {
    if (err) throw err;
    console.log("DB created to delete");
    console.log("Table created to delete");
    console.log("Values inserted successfully");
  });
});