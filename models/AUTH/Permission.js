const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const PermissionSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    modules: { type: String, trim: true, required: true },
    actions: { type: Array, required: true },
    isActive: { type: Boolean, default: true },
    created: { type: Date, default: Date.now }
})


const Permission = mongoose.model('Permission', PermissionSchema, 'AUTH_PERMISSION')

module.exports = {
    Permission, PermissionSchema
}