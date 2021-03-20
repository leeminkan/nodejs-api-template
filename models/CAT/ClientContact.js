const mongoose = require('mongoose');

const ClientContactSchema = new mongoose.Schema({
        code : {type: String, trim:true, required: true},
        firstName: { type: String, trim:true}, // Họ
        lastName: { type: String, trim:true, required: true},// Tên
        slug: { type: String },
        email: { type: String, trim:true}, // Email
        phone: { type: String, trim:true}, // Điện thoại
        address: { type: String, trim:true}, // Địa chỉ
        cmnd: { type: String, trim: true}, // Chứng minh nhân dân
        date_cmnd: { type: String, trim: true}, // Ngày cấp CMND
        date_cmnd_str: { type: Number}, // strtotime Ngày cấp CMND
        birthday: { type: String}, // Ngày sinh
        birthday_str: { type: Number}, // strtotime Ngày sinh
        literacy: { type: String, trim: true}, //Trình độ học vấn
        description: {type: String}, // Giới thiệu, mô tả
        position: {type: String}, // Chức vụ
        officesCode: { // Mã đơn vị cơ sở
            type: String, 
            trim:true,
            ref: 'Offices',
            default: '*'
        },
        isActive: {type: Boolean, default: true},
        userCreate: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//User tạo
        userUpdate: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//User cập nhật
        created: { type: Date, default: Date.now},
        updated: { type: Date, default: Date.now},
        isDelete: {type: Boolean, default: false}
    }, 
    { toJSON: { virtuals: true } }//sử dụng virtual đặt khoá ngoại
)
//đặt khoá ngoại
ClientContactSchema.virtual('offices', {
    ref: 'Offices',
    localField: 'officesCode', 
    foreignField: 'code', 
    justOne: true
});

const ClientContact = mongoose.model('ClientContact', ClientContactSchema, 'CAT_CLIENT_CONTACT')

module.exports = {
    ClientContact, ClientContactSchema
}