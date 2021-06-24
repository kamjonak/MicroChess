const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const axios = require('axios');

var amqp = require('amqplib/callback_api');
var send_channel;
var counter = 0;

var resend_querry = 1000;


function connect_to_rabbit() {
    amqp.connect('amqp://matchmaking_queue', function(error0, connection){
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


router.get('/', (req,res)=>{
    res.render('welcome');
})

router.get('/register', (req,res)=>{
    res.render('register');
})

router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    console.log(req.session.passport.user);
    res.render('dashboard',{
        user: req.user
    });
})

router.get('/test',ensureAuthenticated,(req,res)=>{
    console.log(req.session.passport.user);
    res.render('index',{
        user: req.user
    });
})


router.get('/play',ensureAuthenticated,(req,res)=>{
    console.log(req.session.passport.user);

    res.render('play');
})


function await_game(req, res) {
    axios
        .post('http://matchmaking_server:9001/get_match/', {
            user: req.session.passport.user
        })
        .then(function (response) {
            console.log(response.data);
            if (response.data.status == 0) {
                console.log("game found!")
                res.send({status: 0});
            }
            else if (response.data.status == 1) {
                res.send({status: 1});
            }
            else
                setTimeout(await_game, resend_querry, req, res);
        })
        .catch(function (error) {
            console.log("error await game");
            res.send("error await game");
        }); 
}

router.get('/find_game',ensureAuthenticated,(req,res)=>{
    send_channel.sendToQueue("matchmakingQueue", Buffer.from(req.session.passport.user));
    console.log("sent message to channel");
    await_game(req, res);
})

function get_initial_board_state(req, res) {
    axios
        .post('http://game_server:9002/get_board_state/', {
            player: req.session.passport.user
        })
        .then(function (response) {
            console.log(response.data);
            console.log("got board state!")
            res.send(response.data);
        })
        .catch(function (error) {
            console.log("error initial board state");
            res.send("error initial board state");
        }); 
}

router.get('/get_initial_board_state',ensureAuthenticated,(req,res)=>{
    console.log('getting initial board state')

    setTimeout(get_initial_board_state, resend_querry, req, res);
})

function get_board_state(req, res) {
    axios
        .post('http://game_server:9002/get_board_state/', {
            player: req.session.passport.user
        })
        .then(function (response) {

            console.log("get board response");
            console.log(response.data);
            if (response.data.status != 0) {
                res.send(response.data);
                return;
            }

            if (response.data.color != response.data.turn) {
                setTimeout(get_board_state, resend_querry, req, res);
            }
            else {
                console.log(response.data);
                console.log("got board state!");
                res.send(response.data);
            }
        })
        .catch(function (error) {
            console.log("error board state");
            res.send("error board state");
        }); 
}

router.get('/get_board_state',ensureAuthenticated,(req,res)=>{
    console.log('getting board state')
    get_board_state(req, res);
})

router.post('/update_board_state',ensureAuthenticated,(req,res)=>{
    console.log("updating board state");
    axios
        .post('http://game_server:9002/update_board_state/', {
            player: req.session.passport.user,
            source: req.body.source,
            target: req.body.target
        })
        .then(function (response) {
            console.log(response.data);
            console.log("updated board state!")
            res.send(response.data);
        })
        .catch(function (error) {
            console.log("error update");
            res.send("error update");
        }); 
})

module.exports = router; 