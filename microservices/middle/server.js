'use strict';

const express = require('express');
var cors = require('cors');
const redis = require('ioredis');
const appdb = new redis({host: 'redis'});
// const client = appdb.client();

// const client = redis.createClient();

// Constants
const PORT = 9000;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(cors())

app.get('/', (req, res) => {
    console.log('backend here');
    var siema = req.query.content;
    appdb.set("test", siema);
    res.send("saved");
    console.log('done');
});

app.get('/read', (req, res) => {
    console.log("jestem tutaj sb");
    //var ret = appdb.get("test");
    appdb.get("test", function (err, result) {
        if (err) {
          console.error(err);
        } else {
          console.log(result); // Promise resolves to "bar"
          res.send(result);
        }
      });
    // res.send(ret);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
