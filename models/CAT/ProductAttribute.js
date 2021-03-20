const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const ProductAttributeSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    isActive: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false }
})
const ProductAttribute = mongoose.model('ProductAttribute', ProductAttributeSchema, 'CAT_PRODUCT_ATTRIBUTE')

module.exports = {
    ProductAttribute, ProductAttributeSchema
}