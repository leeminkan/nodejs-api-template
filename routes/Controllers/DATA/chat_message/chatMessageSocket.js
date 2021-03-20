const { ChatMessage, MessagePopulatePath } = require('../../../../models/DATA/ChatMessage');
const { ChatGroup } = require('../../../../models/CAT/ChatGroup');
const moment = require('moment');
const mongoose = require('mongoose');

module.exports.createDataBySocket = async (groupCode, message, sender) => {
    try {
        const group = await ChatGroup.findOne({ code: groupCode, isDelete: false });
        if (!group) return null;
        const timeNow = moment().format();
        const receivers = {
            employeeCodes: [],
            userIds: []
        };
        group.memberArr.forEach((member) => {
            receivers.userIds.push(member.userId);
            receivers.employeeCodes.push(member.employeeCode);
        })
        const newData = new ChatMessage({
            groupChatCode: groupCode,
            senderId: sender.userId,
            senderEmployeeCode: sender.employeeCode,
            receiverIdArr: receivers.userIds,
            receiverEmployeeCodeArr: receivers.employeeCodes,
            type: message.type,
            content: message.content,
            images: message.images,
            timeNow
        });
        await newData.save();
        return await ChatMessage.populate(newData, MessagePopulatePath.Default);
    } catch (err) {
        console.log('socketChatMessage createDataBySocket', err);
        return null;
    }
}

module.exports.updateViewer = async (messageIds, viewer) => {
    try {
        await ChatMessage.updateMany({
            _id: {
                $in: messageIds
            },
            viewerEmployeeCodeArr: {
                $ne: viewer.employeeCode
            },
            viewerIdArr: {
                $ne: viewer.userId
            }
        },
            {
                $push: {
                    viewerEmployeeCodeArr: viewer.employeeCode,
                    viewerIdArr: viewer.userId
                }
            },
            { new: true });

        return await ChatMessage.find({
            _id: {
                $in: messageIds
            }
        })
            .populate(MessagePopulatePath.Default);
    } catch (error) {
        console.log('socketChatMessage updateViewer', error);
        return null;
    }

}

module.exports.test = async (userId) => {
    try {
        ChatMessage.aggregate(
            [
                { "$match": { isDelete: false, 'receiverIdArr': mongoose.Types.ObjectId(userId) } },
                {
                    "$group": {
                        "_id": "$groupChatCode",
                        "doc": { "$last": "$$ROOT" }
                    }
                },
                { "$replaceRoot": { "newRoot": "$doc" } },
                { "$sort": { "created": -1 } },
                { "$limit": 2 }
            ]
        ).then(result => {
            ChatMessage.populate(result, { path: "groupChat senderChat senderProfile receiverChatArr" })
                .then(data => {
                    console.log(JSON.parse(JSON.stringify(data)));
                });
        });
    } catch (err) {
        console.log('socketChatMessage getNewest', err);
        return null;
    }
}