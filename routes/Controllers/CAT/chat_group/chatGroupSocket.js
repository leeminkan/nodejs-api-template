const { ChatGroup } = require('../../../../models/CAT/ChatGroup');
const mongoose = require('mongoose')

module.exports.getAllByUserId = (userId) => {
  return ChatGroup.find({ isDelete: false, 'memberArr.userId': mongoose.Types.ObjectId(userId) })
    .populate('memberArr.userId')
    .then(async (data) => {
      return data
    })
    .catch(err => console.log('socketChatGroup', err))
}