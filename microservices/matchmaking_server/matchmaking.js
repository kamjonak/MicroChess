'use strict';

const express = require('express');
var cors = require('cors');
var amqp = require('amqplib/callback_api');
const axios = require('axios');

var global_var = null;

// Constants
const PORT = 9001;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(cors())

var pairing = {}
var last = null

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

                channel.consume(queue, function(msg) {
                    console.log(" [x] Received %s", msg.content.toString());
                    if (last == null) {
                        last = msg.content.toString()
                    }
                    else {
                        pairing[last] = {opponent: msg.content.toString(), color: 'white'}
                        pairing[msg.content.toString()] = {opponent: last, color: 'black'}
                        let last_cp = last
                        last = null
                        // TODO: info do game server
                        axios
                            .post('http://game_server:9002/create_match/', {
                                player1: msg.content.toString(),
                                player2: last_cp
                            })
                            .then(function (response) {
                                console.log(response.data);
                                res.send("ok")
                            })
                            .catch(function (error) {
                                console.log("error");
                                res.send("error");
                            });
                    }
                  }, {
                      noAck: true
                    });
            });

        }
    });
}

connect_to_rabbit();

app.get('/', (req, res) => {
    console.log("jestem tutaj sb");
    
});

app.post('/get_match', (req, res) => {
    console.log("get_Var");
    let user = req.body.user
    console.log("user: " + user)
    console.log(pairing)
    console.log(last)
    if(user in pairing) {
        console.log("jest gra");
        delete pairing[user]
        res.send({is_set: true})
    }
    else {
        console.log("nie ma gry jeszcze");
        res.send({is_set: false})
    }
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
