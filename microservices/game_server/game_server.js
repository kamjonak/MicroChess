'use strict';

const express = require('express');
var cors = require('cors');
var amqp = require('amqplib/callback_api');
const { Chess } = require('chess.js');

var send_channel;

// Constants
const PORT = 9002;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); 

const game_timeout = 40000;

var player_game = {}

app.use(cors());


function connect_to_rabbit() {
    amqp.connect('amqp://match_history_queue', function(error0, connection){
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
                var queue = 'matchmakingQueue';
            
                channel.assertQueue(queue, {
                    durable: false
                });
                send_channel = channel;
               // channel.sendToQueue(queue, Buffer.from(msg));
                //console.log(" [x] Sent %s", msg);
            });
        }
    });
}

connect_to_rabbit();

function calculate_game_state(game) {
    if (game.in_checkmate())
        return (game.turn() == 'w' ? 'black' : 'white');
    if (game.game_over())
        return 'draw'
    return 'undecided'
}

function get_game_info(player, status) {
    let game_info = player_game[player];
    let [opponent, color] = ((player == game_info.w_player) ? [game_info.b_player, 'white'] : [game_info.w_player, 'black']);
    let game_state = (game_info.game_status == 'undecided' ? calculate_game_state(game_info.game) : game_info.game_status);

    console.log(game_state + ' ' + player);

    if (game_state != 'undecided') {

        let game_to_send = {
            player: player,
            opponent: opponent,
            color: color,
            game_state: game_state,
            pgn: game_info.game.pgn(),
            date: Date.now()
        }
        
        send_channel.sendToQueue("games_to_analyze_queue", Buffer.from(JSON.stringify(game_to_send)));

        delete player_game[player];
    }

    return {
        status: status, 
        opponent: opponent, 
        color: color, 
        fen: game_info.game.fen(), 
        move: ((game_info.game.turn() == 'w') ? 'white' : 'black'),
        game_state: game_state
    }
}

app.post('/create_match', (req, res) => {
    var player1 = req.body.player1;
    var player2 = req.body.player2;
    console.log("creating match for " + player1 + " " + player2);

    var date = Date.now()

    console.log("current date" + date.toString());

    if(player1 in player_game && Math.abs(player_game[player1].last_move_time - date) > game_timeout)
        delete player_game[player1];
    
    if(player2 in player_game && Math.abs(player_game[player2].last_move_time - date) > game_timeout)
        delete player_game[player2];

    console.log("after player check");

    if (player1 in player_game || player2 in player_game) {
        res.send({status:1});
    }
    else {
        var game = new Chess();
        var game_state = {
            game: game, 
            w_player: req.body.player1, 
            b_player: req.body.player2,
            last_move_time: date,
            game_status: 'undecided'
        }
        player_game[player1] = game_state;
        player_game[player2] = game_state;

        res.send({status: 0});
    }
});

app.post('/get_board_state', (req, res) => {
    let player = req.body.player;
    if (!(player in player_game)) {
        console.log(" sb nie ma mnie");
        res.send({status: 1});
        return;
    }

    let game_info = player_game[player];
    let date = Date.now();

    if (Math.abs(date - game_info.last_move_time) > game_timeout) {
        let winner = (player_game[player].game.turn() == 'w' ? 'black' : 'white')
        delete player_game[player];

        res.send({status: 2, winner: winner});
    }
    else {
        res.send(get_game_info(player, 0))
    }
});

app.post('/update_board_state', (req, res) => {
    let player = req.body.player;
    let source = req.body.source;
    let target = req.body.target;

    if (!(player in player_game)) {
        console.log("status = 1")
        res.send({status: 1});
        return;
    }
    let game_info = player_game[player];
    let date = Date.now();

    if (game_info.game_status != 'undecided') {
        res.send(get_game_info(player, 0));
    }

    if (Math.abs(date - game_info.last_move_time) > game_timeout) {
        let winner = (player_game[player].game.turn() == 'w' ? 'black' : 'white')
        delete player_game[player];
        console.log("status = 2")
        res.send({status: 2, winner: winner});
    }
    else {
        let [opponent, color] = ((player == game_info.w_player) ? [game_info.b_player, 'w'] : [game_info.w_player, 'b']);

        if (game_info.game.turn() == color && game_info.game.move({from: source, to:target, promotion: 'q'}) !== null) {
            game_info.last_move_time = Date.now()
            console.log("status = 0")
            res.send(get_game_info(player, 0))
        }
        else {
            console.log("status = 3")
            res.send(get_game_info(player, 3))
        }
    }    
});

app.post('/check_active_game', (req, res) => {
    let player = req.body.player;
    if (player in player_game)
        res.send({status: 0})
    else
        res.send({status: 1})
});

app.post('/surrender', (req, res) => {
    let player = req.body.player;
    console.log("surrender " + player);
    if (player in player_game) {
        player_game[player].game_status = (player == player_game[player].w_player ? 'black' : 'white');
        res.send(get_game_info(player, 0));
    }
    else
        res.send({status: 1});
});



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
