const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const ProductImageSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true }, // id sản phẩm
    image: { type: String, trim: true, required: true }, // ảnh
    isMain: { type: Boolean, default: false } // chọn làm ảnh chính
})

const ProductSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true }, // mã hàng hóa
    barCode: { type: String, trim: true }, // mã vạch
    name: { type: String, trim: true, required: true }, // tên hàng hóa
    slug: { type: String, slug: "name" },
    mainUnit: { type: String, trim: true }, // đơn vị tính chính
    unitArr: [{
        code: { type: String, trim: true }, // mã đvt
        name: { type: String, trim: true }, // tên đvt
        ratio: { type: Number, default: 1 }, // tỷ lệ
        isMain: { type: Boolean, default: false } // chọn làm ĐVT chính
    }],
    attributeArr: [{ // Thuộc tính sản phẩm
        code: { type: String, trim: true },
        name: { type: String, trim: true },
        value: { type: String, trim: true }
    }],
    codeGroup: [
        { // mã nhóm sản phẩm
            type: String,
            trim: true,
            ref: 'ProductGroup'
        }
    ],
    images: [{ ProductImageSchema }], // danh sách ảnh
    description: { type: String }, // mô tả sản phẩm
    origin: { type: String, trim: true }, // Xuất xứ
    supplierCode: { // Thương hiệu
        type: String,
        trim: true,
        ref: 'Supplier'
    },
    officesCode: { // mã đơn vị cơ sở
        type: String,
        trim: true,
        ref: 'Offices',
        default: '*'
    },
    isActive: { type: Boolean, default: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User cập nhật
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false },
    mainPack: { type: String, trim: true }, // thùng chính
    packingArrId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductPacking' }],
    // packingArr : [{ // danh sách thùng đóng
    //     code: {type: String, trim: true},// mã thùng
    //     name: {type: String, trim: true},// tên thùng
    //     volume: {type: SchemaTypes.Double, default:1}, // Giá trị
    //     unit: {type: String, trim: true},// đơn vị tính
    //     ratio: {type: SchemaTypes.Double, default:1}, //Tỷ lệ 1 ĐV Chính = ? Kg
    // }],
    vat: { type: SchemaTypes.Double, default: 0 }
},
    { toJSON: { virtuals: true } }
)


ProductSchema.virtual('brand', {
    ref: 'Brand',
    localField: 'brandCode',
    foreignField: 'code',
    justOne: true
});

ProductSchema.virtual('supplier', {
    ref: 'Supplier',
    localField: 'supplierCode',
    foreignField: 'code',
    justOne: true
});
ProductSchema.virtual('packingArr', {
    ref: 'ProductPacking',
    localField: 'packingArrId',
    foreignField: '_id',
    justOne: false
});
ProductSchema.virtual('productGroup', {
    ref: 'ProductGroup',
    localField: 'codeGroup',
    foreignField: 'code',
    justOne: false
});
ProductSchema.virtual('offices', {
    ref: 'Offices',
    localField: 'officesCode',
    foreignField: 'code',
    justOne: true
});

const Product = mongoose.model('Product', ProductSchema, 'CAT_PRODUCT')

module.exports = {
    Product, ProductSchema
}