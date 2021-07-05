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

const connectToDb = () => {
  users_db.connect("mongodb://users_db:27017/test", options).then(()=>{
    console.log('MongoDB is connected');
  }).catch(err=>{
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
    setTimeout(connectToDb, 5000)
  })
}

connectToDb();

let UserSchema = new users_db.Schema({
    username: String,
    password: String,
    wins: Number,
    loses: Number,
    games_played: Number,
});

const User = users_db.model("User", UserSchema);


app.post('/login', (req, res) => {
    // console.log('received data from front');
    var name = req.body.name;
    var password = req.body.password;
    // console.log(name);
    // console.log(password);

    User.findOne({username: name, password: password}, function (err, user) {
        if (err || user == null)
            res.send({name:"error"});
        else
            res.send({name: user.username});
    });
});

app.post('/register', (req, res) => {
    // console.log('received data from front');
    var name = req.body.name;
    var password = req.body.password;
    // console.log(name);
    // console.log(password);

    var user = new User({username: name, password: password, wins: 0, loses: 0, games_played: 0});
    user.save(function (err, fluffy) {
        if (err) 
            res.send("error");
        // console.log("orrrroo");
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

app.post('/get_stats', (req, res) => {
    var player = req.body.player;

    User.findOne({username: player}, function (err, user) {
        res.send({wins: user.wins, loses: user.loses, games_played: user.games_played});
    });
});

app.post('/player_ended_game', (req, res) => {
    console.log('received data from match history');
    var player = req.body.player;
    var match_result = req.body.result;

    console.log(player);

    User.findOne({username: player}, function (err, user) {
        let wins = user.wins;
        let loses = user.loses;
        let games_played = user.games_played;

        console.log("found user:");
        console.log(user);

        if (match_result == 'win') {
            user.wins++;
            user.games_played++;
        }
        else if (match_result == 'loss') {
            user.loses++;
            user.games_played++;
        }
        else {
            user.games_played++;
        }

        user.save();
    });

    res.send("ok");
});


app.post('/search_users', (req, res) => {
    const querry = req.body.querry;
    console.log(querry)
    let q_regex = new RegExp(querry);
    console.log(q_regex)
    User.find({username:{ $regex: q_regex, $options: 'i' }}, (err, users) => {
        console.log(users);
        let result = [];

        users.forEach(user => {
            result.push({username: user.username, wins: user.wins, loses: user.loses, games_played: user.games_played})
        });
        res.send(result);
    })
});



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
