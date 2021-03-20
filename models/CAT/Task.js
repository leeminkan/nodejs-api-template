const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const TaskEnums = require('../../enums/task');

const TaskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, slug: "name" },
    description: { type: String },
    deadline: { type: Date, default: Date.now },
    timeStart: { type: Date },
    assignedUsers: [{
        _id: false,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isMain: { type: Boolean, default: false }
    }],
    timeComplete: { type: Date },
    subTaskIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' }],
    status: {
        type: String,
        default: TaskEnums.TASK_STATUS.NOT_STARTED
    },
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

TaskSchema.virtual('subTasks', {
    ref: 'SubTask',
    localField: 'subTaskIdArr',
    foreignField: '_id',
    justOne: false
});

const TaskPopulatePath = {
    Default: [
        {
            path: "assignedUsers.userId",
            populate: {
                path: "profile",
                populate: {
                    path: "fileAvatar"
                }
            }
        },
        {
            path: "subTasks",
            match: {
                isDelete: false
            },
            options: {
                sort: { updated: -1 }
            }
        }
    ]
}

const Task = mongoose.model('Task', TaskSchema, 'CAT_TASK')

module.exports = {
    Task, TaskSchema, TaskPopulatePath
}