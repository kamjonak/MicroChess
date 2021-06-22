'use strict';

const express = require('express');
var cors = require('cors');
var amqp = require('amqplib/callback_api');

// Constants
const PORT = 9002;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(cors())

var match = {}
var last_opponents_move = {}

app.get('/', (req, res) => {
    console.log("jestem tutaj sb");
});

app.post('/create_match', (req, res) => {
    console.log("game creating");
    let p1 = req.body.player1
    let p2 = req.body.player2
    console.log("players: " + p1 + " | " + p2)
    match[p1] = {opponent: p2, color: "white"}
    match[p2] = {opponent: p1, color: "black"}
    last_opponents_move[p1] = null
    last_opponents_move[p2] = null
});

app.post('/get_match', (req, res) => {
    console.log("getting game");
    
    let player = req.body.player
    if (player in match) {
        res.send({status: 0, match: match[player]})
    }
    else {
        res.send({status: 1})
    }
});

app.post('/get_board_state', (req, res) => {
    console.log("getting board state");

    let player = req.body.player
    console.log(player)
    console.log(last_opponents_move[player])
    if (last_opponents_move[player] == null) {
        res.send({status: 1})
    }
    else {
        let last_move = last_opponents_move[player]
        last_opponents_move[player] = null
        res.send({status: 0, new_state: last_move})
    }
});

app.post('/update_board_state', (req, res) => {
    console.log("updating game");

    let player = req.body.player
    let new_state = {source: req.body.source, target: req.body.target}

    console.log(new_state)
    console.log(player)
    console.log(match[player].opponent)
    console.log(last_opponents_move[match[player].opponent])
    last_opponents_move[match[player].opponent] = new_state
    console.log(last_opponents_move[match[player].opponent])
    res.send("ok")
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
