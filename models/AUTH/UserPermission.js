const mongoose = require('mongoose');

const UserPermissionSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId,ref: 'User'},
    permissionId: {type: mongoose.Schema.Types.ObjectId,ref: 'Permission'},
    modules: {type: String, required: true},
    actions: {type: Array, required: true}
})
const UserPermission = mongoose.model('UserPermission', UserPermissionSchema, 'AUTH_USER_PERMISSION')

module.exports = {
    UserPermission, UserPermissionSchema
}