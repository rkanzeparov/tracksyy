const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FilmSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    cinemas: {
        type: [String],
        default: []
    }
})

mongoose.model('films', FilmSchema)