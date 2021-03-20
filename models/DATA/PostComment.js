const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const { SimpleUserPopulatePath } = require('../AUTH/User');

const PostCommentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostComment' },
    commentIdArr: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostComment' }],
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

PostCommentSchema.virtual('commentsCount', {
    ref: 'PostComment',
    localField: 'commentIdArr',
    foreignField: '_id',
    justOne: false,
    count: true
});

PostCommentSchema.virtual('comments', {
    ref: 'PostComment',
    localField: 'commentIdArr',
    foreignField: '_id',
    justOne: false
});

const PostCommentPopulatePath = {
    Default: [
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
    ],
    Children: [SimpleUserPopulatePath]
}

const PostComment = mongoose.model('PostComment', PostCommentSchema, 'DATA_POST_COMMENT')

module.exports = {
    PostComment, PostCommentSchema, PostCommentPopulatePath
}