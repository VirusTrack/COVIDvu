const express = require('express')
const request = require('request')

const axios = require('axios')

const cors = require('cors')

const requestIp = require('request-ip');

const app = express()

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true)
    },
};

const environment = process.env.NODE_ENVIRONMENT ? process.env.NODE_ENVIRONMENT : "production"

const main = async (argv) => {
    app.options('*', cors(corsOptions))
    app.set('trust proxy', true);

    app.use('/country', cors(corsOptions), async (req, res) => {
        const ip = requestIp.getClientIp(req);
        const url = `http://ip-api.com/json/${ip}`
        const response = await axios.get(url)

        res.send(response.data)
    })

    console.log("Ready to listen on port 3150")
    app.listen(process.env.PORT || 3150)
}

const argv = require('minimist')(process.argv.slice(2));

main(argv);