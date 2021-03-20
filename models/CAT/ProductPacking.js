const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const ProductPackingSchema = new mongoose.Schema({
    productCode: {
        type: String,
        trim: true,
        required: true,
        ref: 'Product'
    },
    isMain: { type: Boolean, default: false },
    code: { type: String, trim: true },// mã thùng
    name: { type: String, trim: true },// tên thùng
    volume: { type: SchemaTypes.Double, default: 1 }, // Giá trị
    unit: { type: String, trim: true },// đơn vị tính
    ratio: { type: SchemaTypes.Double, default: 1 }, //Tỷ lệ 1 ĐV Chính = ? Kg
    isDelete: { type: Boolean, default: false }
})
const ProductPacking = mongoose.model('ProductPacking', ProductPackingSchema, 'CAT_PRODUCT_PACKING')

module.exports = {
    ProductPacking, ProductPackingSchema
}