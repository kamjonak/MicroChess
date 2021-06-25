'use strict';

const express = require('express');
var cors = require('cors');
const users_db = require('mongoose');

// Constants
const PORT = 9003;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());
app.use(express.urlencoded({
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
    console.log("Trying to connect")
    users_db.connect("mongodb://match_history_db:27017/test", options).then(()=>{
        console.log('MongoDB is connected');
    }).catch(err=>{
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
        setTimeout(connectToDb, 5000)
    })
}

connectToDb();

let GameSchema = new users_db.Schema({
    player: String,
    opponent: String,
    color: String,
    won: Boolean,
    pgn: String,
    date: String
});

const Game = users_db.model("Game", GameSchema);

app.post('/get_match_history', (req, res) => {
    let player = req.body.player

    Game.find({player: player}, function (err, games) {
        console.log(games)
    });
    res.send('ok')
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

