'use strict';

const express = require('express');
var cors = require('cors');
const redis = require('ioredis');
const appdb = new redis({host: 'redis'});
var bodyParser = require('body-parser')
var counter = 0

// Constants
const PORT = 9000;
const HOST = '0.0.0.0';

// App
const app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


app.use(cors())

app.post('/send', (req, res) => {
    console.log('received data from front');
    var name = req.body.query;
    console.log(name);
    console.log(counter.toString());
    appdb.set(counter.toString(), name);
    counter++;
    
    res.send("saved");
    console.log('done');
});

async function getAll() {
    var all = "";
    for (var i = 0; i < counter; i++) {
        let result = await appdb.get(i.toString());
        all += result;
        all += '\n';
    }
    return all;
}

app.post('/read', (req, res) => {
    console.log('read in middle');
    var all;
    getAll().then((value) => {
        console.log(value);
        all = value;
        console.log('done');
        console.log(all);
        res.send(all);
    });
});

app.get('/', (req, res) => {
    console.log("jestem tutaj sb");
    //res.send("ok");
    // appdb.get("test", function (err, result) {
    //     if (err) {
    //       console.error(err);
    //     } else {
    //       console.log(result);
    //       res.send(result);
    //     }
    //   });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
