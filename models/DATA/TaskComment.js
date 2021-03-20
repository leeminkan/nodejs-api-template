const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const TaskCommentSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    subTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' },
    content: { type: String, required: true },
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

const TaskCommentPopulatePath = {
    Default: [
        {
            path: "userCreate",
            populate: {
                path: "profile",
                populate: {
                    path: "fileAvatar"
                }
            }
        }
    ]
}

const TaskComment = mongoose.model('TaskComment', TaskCommentSchema, 'DATA_TASK_COMMENT')

module.exports = {
    TaskComment, TaskCommentSchema, TaskCommentPopulatePath
}