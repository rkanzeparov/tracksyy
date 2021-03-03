const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubsSchema = new Schema({
    uid: {
        type: String,
        default: ''
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
        required: ''
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

mongoose.model('sub', SubsSchema)