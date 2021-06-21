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
                setTimeout(await_game_info, 1000, req, res);
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

// router.get('/find_game',ensureAuthenticated,(req,res)=>{
//     send_channel.sendToQueue("hello", Buffer.from(counter.toString()));
//     counter += 1;
//     console.log("sent message to channel");
//     res.send("ok");

//     receive_channel.get("hello");

// })



// router.get('/send_rabbit',ensureAuthenticated,(req,res)=>{
//     send_channel.sendToQueue("hello", Buffer.from(counter.toString()));
//     counter += 1;
//     console.log("sent message to channel");
//     res.send("ok");
// })

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
                setTimeout(await_game, 1000, req, res);
        })
        .catch(function (error) {
            console.log("error");
            res.send("error");
        }); 
}

// router.get('/receive_rabbit',ensureAuthenticated,(req,res)=>{
//     console.log("RECEIVE RABBIT");
//     await_game(res);
// })

router.get('/find_game',ensureAuthenticated,(req,res)=>{
    send_channel.sendToQueue("matchmakingQueue", Buffer.from(req.session.passport.user));
    console.log("sent message to channel");
    await_game(req, res);
})

module.exports = router; 