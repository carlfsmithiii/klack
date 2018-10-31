const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    lastActive: {
        type: Number
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = { User };