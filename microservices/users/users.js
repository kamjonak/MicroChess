'use strict';

const express = require('express');
var cors = require('cors');
const users_db = require('mongoose');
const bcrypt = require('bcryptjs');

const PORT = 9000;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(cors())

const options = {
    autoIndex: false,
    poolSize: 10,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connectToDb = () => {
  users_db.connect("mongodb://users-db:27017/test", options).then(()=>{
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
    var name = req.body.name;
    var password = req.body.password;

    User.findOne({username: name}, function (err, user) {
        if (err || user == null || !bcrypt.compareSync(password, user.password))
            res.send({name:"error"});
        else
            res.send({name: user.username});
    });
});

app.post('/register', (req, res) => {
    var name = req.body.name;
    var password = req.body.password;

    let hash = bcrypt.hashSync(password, 10);


    User.find({username: name}, function (err, users) {
        if (users.length === 0) {
            var user = new User({username: name, password: hash, wins: 0, loses: 0, games_played: 0});
            user.save(function (err, fluffy) {
                if (err) 
                    res.send("error");
                else
                    res.send("ok");
            });
        }
        else
            res.send("username in use");
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
