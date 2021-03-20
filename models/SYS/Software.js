const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const SoftwareSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    isActive: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
})

const Software = mongoose.model('Software', SoftwareSchema, 'SYS_SOFTWARE')

module.exports = {
    Software, SoftwareSchema
}