const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    telegramId: {
        type: Number,
        required: true
    },
    typeOf: {
        type: Number,
        default: 3
    },
    subs: {
        type: [String],
        default: []
    },
    mysubs: {
        type: [String],
        default: []
    },
    date: {
        type: String,
        default: ''
    }
})

mongoose.model('users', UserSchema)