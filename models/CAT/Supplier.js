const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const SupplierSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true }, //Mã nhà cung cấp
    name: { type: String, trim: true, required: true },//Tên nhà cung cấp
    slug: { type: String, slug: "name" },
    email: { type: String, trim: true },//Email
    phone: { type: String, trim: true },//Điện thoại
    address: { type: String, trim: true },//Địa chỉ
    mst: { type: String, trim: true }, // Mã số thuế
    name_invoice: { type: String, trim: true }, // Số điện thoại xuất hóa đơn
    phone_invoice: { type: String, trim: true }, // Số điện thoại xuất hóa đơn
    address_invoice: { type: String, trim: true }, // Địa chỉ xuất hóa đơn
    addressFrom_code: { type: String, trim: true },
    addressFrom_name: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User cập nhật
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

const Supplier = mongoose.model('Supplier', SupplierSchema, 'CAT_SUPPLIER')

module.exports = {
    Supplier, SupplierSchema
}