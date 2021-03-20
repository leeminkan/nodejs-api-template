const mongoose = require('mongoose');

const CustomerSourceSchema = new mongoose.Schema({
        code : {type: String, trim:true, required: true},
        name : {type: String, trim:true, required: true},
        description : {type: String, trim:true},
        isActive: {type: Boolean, default: true},
        created: { type: Date, default: Date.now},
        updated: { type: Date, default: Date.now},
        isDelete: {type: Boolean, default: false}
    })
const CustomerSource = mongoose.model('CustomerSource', CustomerSourceSchema, 'CAT_PARTNER_SOURCE')

module.exports = {
    CustomerSource, CustomerSourceSchema
}