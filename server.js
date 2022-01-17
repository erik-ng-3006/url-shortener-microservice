require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://erikng3006:erikdeptrai123@cluster0.vk9kc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (err) => {
        if (err) {
            console.log(err)
        }
        console.log('Connected to database')
    })
    // Basic Configuration

const port = process.env.PORT || 3000;
const { Schema } = mongoose;

const urlSchema = new Schema({
    fullUrl: {
        type: String,
        require: true
    },
    shortUrl: {
        type: Number
    }
})



const Url = mongoose.model('Url', urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.post('/api/shorturl', async(req, res) => {
    let defaultShort;

    //Set short url
    try {
        const allUrl = await Url.find({})
        if (allUrl.length === 0) {
            defaultShort = 0
        }
        defaultShort = allUrl.length;
    } catch (err) {
        console.log(err)
    }

    //Validate url
    const urlRegexValidation = /^(ftp|http|https):\/\/[^ "]+$/

    const originalUrl = req.body.url

    if (!urlRegexValidation.test(originalUrl)) {
        res.json({ "error": "Invalid URL" })
    } else {
        defaultShort = defaultShort + 1;
        const newUrl = new Url({
            fullUrl: originalUrl,
            shortUrl: defaultShort
        })

        try {
            await newUrl.save((err, data) => {
                if (err) {
                    console.log(err)
                }
                res.json({ "original_url": newUrl.fullUrl, "short_url": newUrl.shortUrl })
            })

        } catch (err) {
            console.log(err)
        }
    }
});


app.get('/api/shorturl/:input', async(req, res) => {
    const input = req.params.input;
    try {
        Url.findOne({ shortUrl: input }, (err, result) => {
            if (err) {
                return res.json({ error: 'Invalid URL' })
            } else {
                return res.redirect(result.fullUrl)
            }
        })
    } catch (err) {
        console.log(err)
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});