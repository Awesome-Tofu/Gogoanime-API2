const scapper = require('./scrapper')
const express = require('express')
const { env } = require('process')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/', (req, res) => {
    res.send('👋 Hello world🌍, Welcome to 🦄 GogoAnime API 🧬 </br> Available routes : /Popular , /NewSeasons , /search/:query , /getAnime/:animeId , /getEpisode/:episodeId')
})

app.get('/Popular/:page', async (req, res) => {
    const result = await scapper.popular(req.params.page)
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(result, null, 4))
})

app.get('/NewSeasons/:page', async (req, res) => {
    const result = await scapper.newSeason(req.params.page)
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(result, null, 4))
})

app.get('/search/:query', async (req, res) => {

    const result = await scapper.search(req.params.query)
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(result, null, 4))
})

app.get('/getAnime/:query', async (req, res) => {

    const result = await scapper.anime(req.params.query)
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(result, null, 4))
})

app.get('/getEpisode/:query', async (req, res) => {

    const result = await scapper.watchAnime(req.params.query)
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(result, null, 4))
})

app.get('/telegraph', async (req, res) => {

    if(!req.query.url) res.send("'url' param is needed!")

    const result = await scapper.telegraph(req.query.url)
    res.header("Content-Type", 'application/json');
    res.json({src: result})
})

port = env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})
