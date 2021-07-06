'use strict';

const express = require('express');
var cors = require('cors');
var amqp = require('amqplib/callback_api');
const axios = require('axios');

// Constants
const PORT = 9001;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); 

app.use(cors())

var pairing = {}
var last = null

function connect_to_rabbit() {
    amqp.connect('amqp://matchmaking-queue', function(error0, connection){
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
                    if (msg.content.toString() == last || msg.content.toString() in pairing)
                        return;

                    if (last == null) {
                        last = msg.content.toString()
                    }
                    else {
                        let last_cp = last
                        last = null

                        axios
                            .post('http://game-server:9002/create_match/', {
                                player1: msg.content.toString(),
                                player2: last_cp
                            })
                            .then(function (response) {
                                if (response.data.status == 0) {
                                    pairing[last_cp] = {status: 0, opponent: msg.content.toString(), color: 'white'};
                                    pairing[msg.content.toString()] = {status: 0, opponent: last, color: 'black'};
                                }
                                else {
                                    pairing[last_cp] = {status: 1};
                                    pairing[msg.content.toString()] = {status: 1};
                                }
                            })
                            .catch(function (error) {
                                console.log("error");
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

app.post('/get_match', (req, res) => {
    let user = req.body.user
    if(user in pairing) {
        if (pairing[user].status == 0) {
            delete pairing[user]
            res.send({status: 0})
        }
        else {
            delete pairing[user]
            res.send({status: 1})
        }
    }
    else {
        res.send({status: 2})
    }
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
