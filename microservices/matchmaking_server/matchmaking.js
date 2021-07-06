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

var codes = {}
var user_codes = {}
var pairing = {}
var custom_pairing = {}
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
                    let parsed_msg = JSON.parse(msg.content);
                    let type = parsed_msg.type;
                    let user = parsed_msg.user;

                    if (user in pairing && pairing[user].status == 1)
                        delete pairing[user];
                    if (user in pairing && pairing[user].status == 0)
                        return

                    if(type == 'normal') {
                        if (user in user_codes) {
                            delete codes[user_codes[user]];
                            delete user_codes[user];
                        }

                        if (user == last || user in pairing)
                            return;

                        if (last == null) {
                            last = user;
                        }
                        else {
                            let last_cp = last
                            last = null

                            axios
                                .post('http://game-server:9002/create_match/', {
                                    player1: user,
                                    player2: last_cp
                                })
                                .then(function (response) {
                                    if (response.data.status == 0) {
                                        pairing[last_cp] = {status: 0, opponent: user, color: 'white'};
                                        pairing[user] = {status: 0, opponent: last, color: 'black'};
                                    }
                                    else {
                                        pairing[last_cp] = {status: 1};
                                        pairing[user] = {status: 1};
                                    }
                                })
                                .catch(function (error) {
                                    console.log("error");
                                });
                        }
                    }
                    else if (type == 'custom') {
                        if (user == last) 
                            last = null;

                        let code = Math.floor(Math.random() * 90000) + 10000;
                        while (code in codes) {
                            code = Math.floor(Math.random() * 90000) + 10000;
                        }
                        
                        codes[code] = user;
                        user_codes[user] = code;
                    }
                    else if (type == 'custom_join') {
                        if (user == last) 
                            last = null;
                        let code = parsed_msg.code;

                        if (user in user_codes && user_codes[user] in codes) {
                            delete codes[user_codes[user]];
                            delete user_codes[user];
                        }

                        if (code in codes) {
                            let creator = codes[code];
                            delete codes[code];

                            if (user == creator)
                                return;

                            axios
                                .post('http://game-server:9002/create_match/', {
                                    player1: user,
                                    player2: creator
                                })
                                .then(function (response) {
                                    
                                    if (response.data.status == 0) {
                                        pairing[creator] = {status: 0, opponent: user, color: 'white'};
                                        pairing[user] = {status: 0, opponent: last, color: 'black'};
                                    }
                                    else {
                                        pairing[creator] = {status: 1};
                                        pairing[user] = {status: 1};
                                    }
                                })
                                .catch(function (error) {
                                    console.log("error");
                                });
                        }
                        else {
                            pairing[user] = {status: 1};
                        }
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
            pairing[user].status = 1;
            res.send({status: 0})
        }
        else {
            res.send({status: 1})
        }
    }
    else {
        res.send({status: 2})
    }
});

app.post('/get_custom_code', (req, res) => {
    let user = req.body.user
    if(user in user_codes) {
        let code = user_codes[user];

        res.send({status: 0, code: code});
        return;
    }
    else {
        res.send({status: 2})
    }
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
