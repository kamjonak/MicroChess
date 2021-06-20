'use strict';

const express = require('express');
var cors = require('cors');
const users_db = require('mongoose');
var bodyParser = require('body-parser')

// Constants
const PORT = 9000;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(cors())

const options = {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connectWithRetry = () => {
  users_db.connect("mongodb://users_db:27017/test", options).then(()=>{
    console.log('MongoDB is connected');
  }).catch(err=>{
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
    setTimeout(connectWithRetry, 5000)
  })
}

connectWithRetry();

let UserSchema = new users_db.Schema({
    username: String,
    password: String
});

const User = users_db.model("User", UserSchema);


app.post('/login', (req, res) => {
    console.log('received data from front');
    var name = req.body.name;
    var password = req.body.password;
    console.log(name);
    console.log(password);

    User.findOne({username: name, password: password}, function (err, user) {
        if (err || user == null)
            res.send({name:"error"});
        else
            res.send({name: user.username});
    });
});

app.post('/register', (req, res) => {
    console.log('received data from front');
    var name = req.body.name;
    var password = req.body.password;
    console.log(name);
    console.log(password);

    var user = new User({username: name, password: password});
    user.save(function (err, fluffy) {
        if (err) 
            res.send("error");
        console.log("orrrroo");
        res.send("ok");
    });
});

app.post('/getUserById', (req, res) => {
    console.log('received data from front');
    var id = req.body.id;
    console.log(id);

    User.findOne({id: id}, function (err, user) {
        if (err || user == null)
            res.send({id: -1, name:"error"});
        else
            res.send({id: 1, name: user.username});
    });
});

app.post('/read', (req, res) => {
    console.log('read in middle');
    var all;
    getAll().then((value) => {
        console.log(value);
        all = value;
        console.log('done');
        console.log(all);
        res.send(all);
    });
});

app.get('/', (req, res) => {
    console.log("jestem tutaj sb");
    //res.send("ok");
    // appdb.get("test", function (err, result) {
    //     if (err) {
    //       console.error(err);
    //     } else {
    //       console.log(result);
    //       res.send(result);
    //     }
    //   });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
