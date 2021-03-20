const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const chatEnums = require('../../enums/chat');

const ChatGroupSchema = new mongoose.Schema({
    code: { type: String, trim: true },
    type: { type: String, enum: [chatEnums.GROUP_TYPE.SINGLE, chatEnums.GROUP_TYPE.MULTIPE], default: chatEnums.GROUP_TYPE.SINGLE },
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User tạo
    userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User cập nhật
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    timeNow: { type: Date, default: Date.now },
    memberArr: [{
        _id: false,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        employeeCode: {
            type: String,
            trim: true,
            ref: 'Employee'
        },
        name: { type: String, trim: true },
        isMain: { type: Boolean, default: false }
    }],
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

const ChatGroup = mongoose.model('ChatGroup', ChatGroupSchema, 'CAT_CHAT_GROUP')


const ChatGroupPopulatePath = {
    Default: [{ path: "memberArr.userId" },
    {
        path: "memberArr.employeeId",
        populate: {
            path: "fileAvatar"
        }
    }
    ]
}

module.exports = {
    ChatGroup, ChatGroupSchema, ChatGroupPopulatePath
}