const mongoose = require('mongoose');
const SchemaTypes = mongoose.Schema.Types;

const ServiceSchema = new mongoose.Schema({
        code : {type: String, trim:true, required: true},
        name : {type: String, trim:true, required: true},
        price : {type: SchemaTypes.Double, trim:true, default: 0},
        warranty : {type: SchemaTypes.Double, trim:true, default: 0},
        actionTime : {type: SchemaTypes.Double, trim:true, default: 0},
        codeGroup:[
            { 
                type: String, 
                trim:true,
                ref: 'ServiceGroup'
            }
        ],
        description : {type: String, trim:true},
        isActive: {type: Boolean, default: true},
        created: { type: Date, default: Date.now},
        updated: { type: Date, default: Date.now},
        isDelete: {type: Boolean, default: false}
    })
const Service = mongoose.model('Service', ServiceSchema, 'CAT_SERVICE')
ServiceSchema.virtual('serviceGroup', {
    ref: 'ServiceGroup',
    localField: 'codeGroup', 
    foreignField: 'code', 
    justOne: false
    });
module.exports = {
    Service, ServiceSchema
}