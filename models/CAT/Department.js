const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const DepartmentSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    officesCode: {
        type: String,
        trim: true,
        ref: 'Offices',
        default: '*'
    },
    isActive: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

DepartmentSchema.virtual('offices', {
    ref: 'Offices',
    localField: 'officesCode',
    foreignField: 'code',
    justOne: true
});

const Department = mongoose.model('Department', DepartmentSchema, 'CAT_DEPARTMENT')

module.exports = {
    Department, DepartmentSchema
}