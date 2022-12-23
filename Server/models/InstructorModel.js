const mongoose = require('mongoose')

const instructorSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter your first name"],
        trim: true 
    },
    lastname: {
        type: String,
        required: [true, "Please enter your last name"],
        trim: true 
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
        trim: true 
    },
    emgNo: {
        type: String,
        required: [true, "Please enter your emergency phone number"],
        trim: true 
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        trim: true 
    },
    nic: {
        type: String,
        required: [true, "Please enter your NIC"],
        trim: true 
    },
    role: {
        type: Number,
        default: 1 // 0 = admin, 1 = instructor, 2 = member
    },
    address: {
        type: String,
        required: [true, "Please enter your address"],
        trim: true 
    },
    dob: {
        type: String,
        required: [true, "Please select your birthday"],
        trim: true 
    },
    gender: {
        type: String,
        required: [true, "Please select your gender"],
        trim: true 
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/fituscloud/image/upload/v1659693106/FitUS_Avatar/default_avatar_yemfqd.png"
    },

}, {
    timestamps: true
})

module.exports = mongoose.model("Instructors", instructorSchema)