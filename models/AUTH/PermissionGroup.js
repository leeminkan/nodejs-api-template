const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const PermissionGroupSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    details: [{
        permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
        actions: { type: Array, required: true },
        modules: { type: String, required: true, trim: true }
    }],
    isActive: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
})
const PermissionGroup = mongoose.model('PermissionGroup', PermissionGroupSchema, 'AUTH_PERMISSION_GROUP')

module.exports = {
    PermissionGroup, PermissionGroupSchema
}