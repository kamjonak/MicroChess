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



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
