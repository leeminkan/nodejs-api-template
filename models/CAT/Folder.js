const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const FolderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, slug: "name" },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    isActive: { type: Boolean, default: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //User cập nhật
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    timeNow: { type: Date, default: Date.now },
    isSystemFolder: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

const Folder = mongoose.model('Folder', FolderSchema, 'CAT_FOLDER')

module.exports = {
    Folder, FolderSchema
}