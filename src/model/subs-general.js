const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubsGeneralSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    date: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    },
    unsub: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    }
})

mongoose.model('subgen', SubsGeneralSchema)