const mongoose = require('mongoose');
const chatEnums = require('../../enums/chat');


const ChatMessageSchema = new mongoose.Schema({
  groupChatCode: { type: String, trim: true, ref: 'GroupChat' },
  senderEmployeeCode: {
    type: String,
    trim: true,
    ref: 'Employee'
  },
  receiverEmployeeCodeArr: [{
    type: String,
    trim: true,
    ref: 'Employee'
  }],
  viewerEmployeeCodeArr: [{
    type: String,
    trim: true,
    ref: 'Employee'
  }],
  targetEmployeeCodeArr: [{
    type: String,
    trim: true,
    ref: 'Employee'
  }],
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  viewerIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  targetIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: [chatEnums.MESSAGE_TYPE.TEXT, chatEnums.MESSAGE_TYPE.IMAGE], default: chatEnums.MESSAGE_TYPE.TEXT },
  content: { type: String, trim: true, default: "" },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  timeNow: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  isSystemNotification: { type: Boolean, default: false },
  forEvent: { type: String, default: "" },
  isDelete: { type: Boolean, default: false }
},
  { toJSON: { virtuals: true } }
);
ChatMessageSchema.virtual('groupChat', {
  ref: 'ChatGroup',
  localField: 'groupChatCode',
  foreignField: 'code',
  justOne: true
});
ChatMessageSchema.virtual('senderChat', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});
ChatMessageSchema.virtual('receiverChatArr', {
  ref: 'User',
  localField: 'receiverIdArr',
  foreignField: '_id',
  justOne: false
});
ChatMessageSchema.virtual('viewerChatArr', {
  ref: 'User',
  localField: 'viewerIdArr',
  foreignField: '_id',
  justOne: false
});
ChatMessageSchema.virtual('targetChatArr', {
  ref: 'User',
  localField: 'targetIdArr',
  foreignField: '_id',
  justOne: false
});
ChatMessageSchema.virtual('senderProfile', {
  ref: 'Employee',
  localField: 'senderEmployeeCode',
  foreignField: 'code',
  justOne: true
});
ChatMessageSchema.virtual('receiverProfileArr', {
  ref: 'Employee',
  localField: 'receiverEmployeeCodeArr',
  foreignField: 'code',
  justOne: false
});
ChatMessageSchema.virtual('viewerProfileArr', {
  ref: 'Employee',
  localField: 'viewerEmployeeCodeArr',
  foreignField: 'code',
  justOne: false
});
ChatMessageSchema.virtual('targetProfileArr', {
  ref: 'Employee',
  localField: 'targetEmployeeCodeArr',
  foreignField: 'code',
  justOne: false
});

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema, 'DATA_CHAT_MESSAGE')

const MessagePopulatePath = {
  Default: [{ path: "images" },
  {
    path: "senderChat",
    populate: {
      path: "profile",
      populate: {
        path: "fileAvatar"
      }
    }
  },
  {
    path: "receiverChatArr",
    populate: {
      path: "profile",
      populate: {
        path: "fileAvatar"
      }
    }
  },
  {
    path: "viewerChatArr",
    populate: {
      path: "profile",
      populate: {
        path: "fileAvatar"
      }
    }
  },
  {
    path: "targetChatArr",
    populate: {
      path: "profile",
      populate: {
        path: "fileAvatar"
      }
    }
  },
  {
    path: "groupChat",
    populate: [
      {
        path: "memberArr.userId"
      }, {
        path: "memberArr.employeeId",
        populate: {
          path: "fileAvatar"
        }
      }
    ]
  }]
}

module.exports = {
  ChatMessage, ChatMessageSchema, MessagePopulatePath
}