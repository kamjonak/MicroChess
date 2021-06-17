'use strict';

const express = require('express');
var cors = require('cors');
const path = require('path');
const axios = require('axios');

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
    console.log('sending to middle');
    console.log(req.query.content);
    axios
        .post('http://middle:9000/send/', {
            query: req.query.content
        })
        .then(function (response) {
            console.log("response");
        })
        .catch(function (error) {
            console.log("error");
        }); 

    res.send('ok');
});

app.get('/read', (req, res) => {
    console.log('reading from middle');
    axios
        .post('http://middle:9000/read/', {
            query: req.query.content
        })
        .then(function (response) {
            console.log("response:");
            console.log(response.data);
            res.send(response.data);
        })
        .catch(function (error) {
            console.log("error");
        }); 
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
