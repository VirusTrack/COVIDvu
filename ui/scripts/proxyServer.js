const express = require('express')
const request = require('request')

const axios = require('axios')

const cors = require('cors')

const app = express()

const fs = require('fs')

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true)
    },
};

const PRODUCTION_URL = 'https://virustrack.live/site-data'

const main = async (argv) => {
    console.dir(argv)

    app.options('*', cors(corsOptions))

    if(argv.localCache) {

        if(fs.existsSync('site-data')) {
            fs.existsSync('./site-data/bundle-global.json') && fs.unlinkSync('./site-data/bundle-global.json')
            fs.existsSync('./site-data/bundle-continental-regions.json') && fs.unlinkSync('./site-data/bundle-continental-regions.json')
            fs.existsSync('./site-data/bundle-US.json') && fs.unlinkSync('./site-data/bundle-US.json')
            fs.existsSync('./site-data/bundle-US-Regions.json') && fs.unlinkSync('./site-data/bundle-US-Regions.json')
            fs.existsSync('./site-data/last-update.txt') && fs.unlinkSync('./site-data/last-update.txt')
        } else {
            fs.mkdirSync('./site-data')
        }

        const global = await axios.get(`${PRODUCTION_URL}/bundle-global.json`)
        const continental_regions = await axios.get(`${PRODUCTION_URL}/bundle-continental-regions.json`)
        const us_states = await axios.get(`${PRODUCTION_URL}/bundle-US.json`)
        const us_regions = await axios.get(`${PRODUCTION_URL}/bundle-US-Regions.json`)
        const last_update = await axios.get(`${PRODUCTION_URL}/last-update.txt`)
           
        fs.writeFileSync('./site-data/bundle-global.json', JSON.stringify(global.data))
        fs.writeFileSync('./site-data/bundle-continental-regions.json', JSON.stringify(continental_regions.data))
        fs.writeFileSync('./site-data/bundle-US.json', JSON.stringify(us_states.data))
        fs.writeFileSync('./site-data/bundle-US-Regions.json', JSON.stringify(us_regions.data))
        fs.writeFileSync('./site-data/last-update.txt', JSON.stringify(last_update.data))
    } else if(argv.serveLocalCache) {

        if(fs.existsSync('./site-data/bundle-global.json') && 
                fs.existsSync('./site-data/bundle-global.json') && 
                fs.existsSync('./site-data/bundle-global.json') && 
                fs.existsSync('./site-data/bundle-global.json') &&
                fs.existsSync('./site-data/last-update.txt')) {

            app.use('/site-data/bundle-global.json', cors(corsOptions), (req, res) => {
                res.send(fs.readFileSync('./site-data/bundle-global.json'))
            })

            app.use('/site-data/bundle-continental-regions.json', cors(corsOptions), (req, res) => {
                res.send(fs.readFileSync('./site-data/bundle-continental-regions.json'))
            })

            app.use('/site-data/bundle-US.json', cors(corsOptions), (req, res) => {
                res.send(fs.readFileSync('./site-data/bundle-US.json'))
            })

            app.use('/site-data/bundle-US-Regions.json', cors(corsOptions), (req, res) => {
                res.send(fs.readFileSync('./site-data/bundle-US-Regions.json'))
            })

            app.use('/site-data/last-update.txt', cors(corsOptions), (req, res) => {
                res.send(fs.readFileSync('./site-data/last-update.txt'))
            })

            app.listen(process.env.PORT || 3100)
        }
    } else if(argv.serveCache) {
        const global = await axios.get(`${PRODUCTION_URL}/bundle-global.json`)
        const continental_regions = await axios.get(`${PRODUCTION_URL}/bundle-continental-regions.json`)
        const us_states = await axios.get(`${PRODUCTION_URL}/bundle-US.json`)
        const us_regions = await axios.get(`${PRODUCTION_URL}/bundle-US-Regions.json`)
        const last_update = await axios.get(`${PRODUCTION_URL}/last-update.txt`)

        app.use('/site-data/bundle-global.json', cors(corsOptions), (req, res) => {
            res.send(global.data)
        })

        app.use('/site-data/bundle-continental-regions.json', cors(corsOptions), (req, res) => {
            res.send(continental_regions.data)
        })

        app.use('/site-data/bundle-US.json', cors(corsOptions), (req, res) => {
            res.send(us_states.data)
        })

        app.use('/site-data/bundle-US-Regions.json', cors(corsOptions), (req, res) => {
            res.send(us_regions.data)
        })

        app.use('/site-data/last-update.txt', cors(corsOptions), (req, res) => {
            res.send(last_update.data)
        })

        app.listen(process.env.PORT || 3100)

    } else {
        app.use('/', cors(corsOptions), (req, res) => {
            console.log(req.url)

            const request_url = `https://virustrack.live${req.url}`

            console.log(`request_url: ${request_url}`)
            req.pipe(request(request_url)).pipe(res)
        });

        app.listen(process.env.PORT || 3100)
    }
}

const argv = require('minimist')(process.argv.slice(2));

main(argv);