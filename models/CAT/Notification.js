const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const i18n = require('i18n');

const NotificationSchema = new mongoose.Schema({
    event: { type: String },
    data: {},
    topics: { type: String },
    customContent: { type: String },
    templateContent: { type: String },
    targetIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewerIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attributes: {},
    priority: { type: String },
    collapseKey: { type: String },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //User cập nhật
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    timeNow: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

NotificationSchema.virtual('content').get(function () {
    if (this.templateContent) {
        let content = this.templateContent;
        for (const [key, value] of Object.entries(this.attributes)) {
            content = content.replace(`%${key}%`, value);
        }
        return content;
    }
    return "";
});

const Notification = mongoose.model('Notification', NotificationSchema, 'CAT_NOTIFICATION')

module.exports = {
    Notification, NotificationSchema
}