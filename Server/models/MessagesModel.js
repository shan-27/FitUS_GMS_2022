const mongoose = require('mongoose')

const memberSchema = new mongoose.Schema({

    sender: {
        type: String,
        required: [true, "Please enter your first name"],
        trim: true 
    },
    msgBody: {
        type: String,
        required: [true, "Please enter group No"],
        trim: true 
    },
    time: {
        type: String,
        // required: [true, "Please enter group No"],
        trim: true 
    },
    date: {
        type: String,
        trim: true 
    },


}, {
    timestamps: true
})

module.exports = mongoose.model("Messages", memberSchema)