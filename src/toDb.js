const mongoose = require('mongoose')
require('./model/subs-general')
const config = require('./config')
mongoose.connect(config.DB_URL, {
    useMongoClient: true
})
    .then(() => console.log("Mongo connected"))
    .catch((err) => console.log(err))
const database = require('../database.json')
const SubsGeneral = mongoose.model('subgen')

database.subsGeneral.forEach(f => new SubsGeneral(f).save())