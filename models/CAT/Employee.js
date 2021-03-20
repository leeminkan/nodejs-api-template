const mongoose = require('mongoose');
const { File } = require('../DATA/File');
const uploadSettings = require('../../config/upload');

const EmployeeSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true },
    firstName: { type: String, trim: true }, // Họ
    lastName: { type: String, trim: true, required: true },// Tên
    slug: { type: String },
    idOrther: { type: String, default: "" },

    email: { type: String, trim: true }, // Email
    phone: { type: String, trim: true }, // Điện thoại
    avatar: { type: String, trim: true, default: "" }, // Điện thoại
    fileAvatar: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    address: { type: String, trim: true }, // Địa chỉ
    cmnd: { type: String, trim: true }, // Chứng minh nhân dân
    date_cmnd: { type: String, trim: true }, // Ngày cấp CMND
    date_cmnd_str: { type: Number }, // strtotime Ngày cấp CMND
    birthday: { type: String }, // Ngày sinh
    birthday_str: { type: Number }, // strtotime Ngày sinh
    gender: { type: String, trim: true },
    literacy: { type: String, trim: true }, //Trình độ học vấn
    description: { type: String }, // Giới thiệu, mô tả
    position: { type: String }, // Chức vụ
    departmentCode: { // Mã phòng ban
        type: String,
        trim: true,
        ref: 'Department'
    },
    officesCode: { // Mã đơn vị cơ sở
        type: String,
        trim: true,
        ref: 'Offices',
        default: '*'
    },
    codeOffice: [
        { // mã chi nhanh
            type: String,
            trim: true,
            ref: 'Offices'
        }
    ],
    isActive: { type: Boolean, default: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User cập nhật
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }//sử dụng virtual đặt khoá ngoại
)

EmployeeSchema.pre('save', async function (next) {
    if (!this.fileAvatar) {
        const defaultAvatar = await File.findOne({
            defaultType: uploadSettings.DEFAULT_TYPE.DEFAULT_AVATAR,
            isDelete: false
        });
        if (defaultAvatar) {
            this.fileAvatar = defaultAvatar._id;
        }
    }
    next();
});

//đặt khoá ngoại
EmployeeSchema.virtual('offices', {
    ref: 'Offices',
    localField: 'officesCode',
    foreignField: 'code',
    justOne: true
});
EmployeeSchema.virtual('department', {
    ref: 'Department',
    localField: 'departmentCode',
    foreignField: 'code',
    justOne: true
});
const Employee = mongoose.model('Employee', EmployeeSchema, 'CAT_EMPLOYEE')

module.exports = {
    Employee, EmployeeSchema
}