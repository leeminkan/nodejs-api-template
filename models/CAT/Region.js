const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const RegionSchema = new mongoose.Schema({
    code: { type: String, trim: true },
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    isActive: { type: Boolean, default: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User cập nhật
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

const Region = mongoose.model('Region', RegionSchema, 'CAT_REGION')

module.exports = {
    Region, RegionSchema
}