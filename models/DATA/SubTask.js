const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const SubTaskSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    name: { type: String, required: true },
    slug: { type: String, slug: "name" },
    description: { type: String },
    isComplete: { type: Boolean, default: false },
    timeComplete: { type: Date },
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

const SubTask = mongoose.model('SubTask', SubTaskSchema, 'DATA_SUB_TASK')

module.exports = {
    SubTask, SubTaskSchema
}