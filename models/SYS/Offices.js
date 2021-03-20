const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const OfficesSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    idWeva: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    hotline: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
})

const Offices = mongoose.model('Offices', OfficesSchema, 'SYS_OFFICES')

module.exports = {
    Offices, OfficesSchema
}