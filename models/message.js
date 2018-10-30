const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    sender: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    timestamp: {
        type: Number,
        required: true,
    }
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = { Message };