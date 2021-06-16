'use strict';

const express = require('express');
var cors = require('cors');
const path = require("path");

const PORT = 80;
const HOST = '0.0.0.0';

// App
const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(cors())

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/read', (req, res) => {
    res.render('index');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
