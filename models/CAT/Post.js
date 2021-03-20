const mongoose = require('mongoose');
const { SimpleUserPopulatePath } = require('../AUTH/User');

const PostSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: "" },
  content: { type: String, trim: true, default: "" },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  commentIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostComment' }],
  viewerIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  timeNow: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false }
},
  { toJSON: { virtuals: true } }
)

PostSchema.virtual('commentsCount', {
  ref: 'PostComment',
  localField: 'commentIdArr',
  foreignField: '_id',
  justOne: false,
  count: true
});

PostSchema.virtual('comments', {
  ref: 'PostComment',
  localField: 'commentIdArr',
  foreignField: '_id',
  justOne: false
});

const PostPopulatePath = {
  Default: [{ path: "videos images commentsCount" },
    SimpleUserPopulatePath,
  {
    path: "viewerIdArr",
    select: '_id employeeCode',
    populate: {
      path: "profile",
      select: '_id firstName lastName fileAvatar',
      populate: {
        path: "fileAvatar"
      }
    }
  },
  {
    path: "comments",
    match: {
      parentId: null,
      isDelete: false
    },
    options: {
      limit: 1,
      sort: { updated: -1 }
    },
    populate: [
      SimpleUserPopulatePath,
      {
        path: "comments commentsCount",
        match: {
          isDelete: false
        },
        options: {
          limit: 1,
          sort: { created: -1 }
        },
        populate: SimpleUserPopulatePath
      }
    ]
  }]
}

const Post = mongoose.model('Post', PostSchema, 'CAT_POST')

module.exports = {
  Post, PostSchema, PostPopulatePath
}