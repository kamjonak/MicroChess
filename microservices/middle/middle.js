'use strict';

const express = require('express');
var cors = require('cors');
const redis = require('ioredis');
const appdb = new redis({host: 'redis'});


// Constants
const PORT = 9000;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(cors())

// app.get('/send', (req, res) => {
//     console.log('backend here');
//     var siema = req.query.content;
//     console.log(siema);
//     appdb.set("test", siema);
//     res.send("saved");
//     console.log('done');
// });

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
