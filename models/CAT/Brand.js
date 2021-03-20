const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const BrandSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    address: { type: String, trim: true },
    description: { type: String, trim: true },

    phone: { type: String, trim: true },
    slug: { type: String, slug: "name" },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User cập nhật
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

const Brand = mongoose.model('Brand', BrandSchema, 'CAT_BRAND')

module.exports = {
    Brand, BrandSchema
}