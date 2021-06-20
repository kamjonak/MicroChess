'use strict';

const express = require('express');
var cors = require('cors');
var amqp = require('amqplib/callback_api');

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
                var queue = 'hello';
            
                channel.assertQueue(queue, {
                    durable: false
                });

                channel.consume(queue, function(msg) {
                    console.log(" [x] Received %s", msg.content.toString());
                    global_var = msg.content.toString();
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

app.get('/get_var', (req, res) => {
    console.log("get_Var");
    if(global_var == null) {
        console.log("NULL");
        res.send({is_set: false})
    }
    else {
        console.log("NOT NULL");
        res.send({is_set: true, var: global_var})
        global_var = null;
    }
});



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
