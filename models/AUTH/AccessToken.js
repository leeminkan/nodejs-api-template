const mongoose = require('mongoose');

const AccessTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    token: {type: String, trim:true, required: true},
    iat: {type: Number, required: true},
    exp: {type: Number, required: true},
    created: { type: Date, default: Date.now}
})
const AccessToken = mongoose.model('AccessToken', AccessTokenSchema, 'ACCESS_TOKEN')

module.exports = {
    AccessToken, AccessTokenSchema
}