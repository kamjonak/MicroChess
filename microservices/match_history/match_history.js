'use strict';

const express = require('express');
var cors = require('cors');
const users_db = require('mongoose');
var amqp = require('amqplib/callback_api');
const axios = require('axios');

// Constants
const PORT = 9003;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); 

app.use(cors());

const options = {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connectToDb = () => {
    console.log("Trying to connect")
    users_db.connect("mongodb://match-history-db:27017/test", options).then(()=>{
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
    game_state: String,
    pgn: String,
    date: String
});

const Game = users_db.model("Game", GameSchema);

function connect_to_rabbit() {
    amqp.connect('amqp://match-history-queue', function(error0, connection){
        if (error0) {
            console.log("unsuccessful rabbit connection");
            setTimeout(connect_to_rabbit, 5000);
        }
        else {
            console.log("rabbit connected");
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }
                var queue = 'games_to_analyze_queue';
            
                channel.assertQueue(queue, {
                    durable: false
                });

                channel.consume(queue, function(msg) {
                    let game_info = JSON.parse(msg.content.toString());
                    console.log(" [x] Received %s", game_info);
                    let game = new Game(game_info);
                    game.save();

                    let game_result = (game_info.color == game_info.game_state ? 'win' : (game_info.game_state == 'draw' ? 'draw' : 'loss'));


                    console.log(game_info.player);
                    console.log(game_result);

                    axios
                        .post('http://users:9000/player_ended_game/', {
                            player: game_info.player,
                            result: game_result
                        })
                        .then(function (response) {
                        })
                        .catch(function (error) {
                            console.log("ERROR IN PLAYER ENDED GAME");
                        }); 
                }, 
                {
                      noAck: true
                });
            });

        }
    });
}

connect_to_rabbit();

app.post('/get_match_history', (req, res) => {
    let player = req.body.player

    Game.find({player: player}, function (err, games) {
        console.log(games);
        res.send(games);
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

