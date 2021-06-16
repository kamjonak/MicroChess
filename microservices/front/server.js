'use strict';

const express = require('express');
var cors = require('cors');

//express.set("views", path.join(__dirname, "views"));

const PORT = 80;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(cors())

app.get('/', (req, res) => {
    
});

app.get('/read', (req, res) => {
    //res.render('index');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
