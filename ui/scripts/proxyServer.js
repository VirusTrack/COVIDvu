const express = require('express');
const request = require('request');

const cors = require('cors');

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true);
    },
};

app.options('*', cors(corsOptions));

app.use('/', cors(corsOptions), (req, res) => {
    console.log(req.url);

    const request_url = `https://virustrack.live${req.url}`;

    console.log(`request_url: ${request_url}`)
    req.pipe(request(request_url)).pipe(res);
});

app.listen(process.env.PORT || 3100);
