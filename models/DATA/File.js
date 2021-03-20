const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    originalName: { type: String, default: "" },
    slug: { type: String, slug: "name" },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    link: { type: String, default: "" },
    path: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    extension: { type: String, default: "" },
    type: { type: String, default: "" },
    size: { type: String, default: "" },
    encoding: { type: String, default: "" },
    dimensions: {
        width: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    isActive: { type: Boolean, default: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //User cập nhật
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    timeNow: { type: Date, default: Date.now },
    isSystemFile: { type: Boolean, default: false },
    defaultType: { type: String, default: "" },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

const File = mongoose.model('File', FileSchema, 'DATA_FILE')

module.exports = {
    File, FileSchema
}