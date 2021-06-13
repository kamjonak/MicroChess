'use strict';

const express = require('express');
var cors = require('cors')

// Constants
const PORT = 9000;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(cors())

app.get('/', (req, res) => {
    console.log('backend here');
    var siema = req.query.content;
    res.send(siema + siema);
    console.log('masno');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);