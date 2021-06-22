const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const axios = require('axios');

var amqp = require('amqplib/callback_api');
var send_channel;
var counter = 0;


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

function await_game_info(req, res) {
    axios
        .post('http://game_server:9002/get_match/', {
            player: req.session.passport.user
        })
        .then(function (response) {
            console.log(response.data);
            if (response.data.status == 0) {
                console.log("found game params")
                res.render('play', response.data.match);
            }
            else
                setTimeout(await_game_info, 20, req, res);
        })
        .catch(function (error) {
            console.log("error");
            res.send("error");
        }); 
}

router.get('/play',ensureAuthenticated,(req,res)=>{
    console.log(req.session.passport.user);

    await_game_info(req, res)
})


function await_game(req, res) {
    axios
        .post('http://matchmaking_server:9001/get_match/', {
            user: req.session.passport.user
        })
        .then(function (response) {
            console.log(response.data);
            if (response.data.is_set) {
                console.log("game found!")
                res.send("ok");
            }
            else
                setTimeout(await_game, 20, req, res);
        })
        .catch(function (error) {
            console.log("error");
            res.send("error");
        }); 
}

function await_get_board_state(req, res) {
    axios
        .post('http://game_server:9002/get_board_state/', {
            player: req.session.passport.user
        })
        .then(function (response) {
            console.log(response.data);
            if (response.data.status == 0) {
                console.log("got board state!")
                console.log(response.data.new_state)
                res.send(response.data.new_state);
            }
            else
                setTimeout(await_get_board_state, 20, req, res);
        })
        .catch(function (error) {
            console.log("error");
            res.send("error");
        }); 
}

router.get('/find_game',ensureAuthenticated,(req,res)=>{
    send_channel.sendToQueue("matchmakingQueue", Buffer.from(req.session.passport.user));
    console.log("sent message to channel");
    await_game(req, res);
})

router.get('/get_board_state',ensureAuthenticated,(req,res)=>{
    console.log('getting board state')
    await_get_board_state(req, res)
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
            console.log("error");
            res.send("error");
        }); 
})

module.exports = router; 