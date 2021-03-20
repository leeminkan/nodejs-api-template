const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
        code : {type: String, trim:true, required: true},
        name : {type: String, trim:true, required: true},
        isActive: {type: Boolean, default: true},
        created: { type: Date, default: Date.now},
        updated: { type: Date, default: Date.now},
        isDelete: {type: Boolean, default: false}
    })
const Unit = mongoose.model('Unit', UnitSchema, 'CAT_UNIT')

module.exports = {
    Unit, UnitSchema
}