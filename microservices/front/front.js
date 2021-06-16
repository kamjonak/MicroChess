'use strict';

const express = require('express');
var cors = require('cors');
const path = require('path');
const axios = require('axios');
const oro = new express({host: 'middle'});

const PORT = 80;
const HOST = '0.0.0.0';

// App
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors())

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/send', (req, res) => {
    //console.log('siema');
    oro.send("siemanero");

    // axios
    //     .get('middle:/send', {
    //     })
    //     .then(res2 => {
    //         console.log(`statusCode: ${res2.statusCode}`);
    //         console.log(res2);
    //     })
    //     .catch(error => {
    //         console.error(error);
    //     });

    // res.send('ok');
});

app.get('/read', (req, res) => {
    console.log('siema2');
    res.send('ok');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
