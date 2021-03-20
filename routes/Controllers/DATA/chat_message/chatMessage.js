const { ChatMessage, MessagePopulatePath } = require('../../../../models/DATA/ChatMessage');
const { ChatGroup } = require('../../../../models/CAT/ChatGroup');
const keys = require('../../../../config/index');
const { resultGet, resultGetById, resultCreate, resultUpdate, resultActive, resultActiveMany, resultdelete } = require('../../../../utils/message')
const moment = require('moment');
const mongoose = require('mongoose');
// ! unuse
module.exports.createData = (req, res, next) => {
    const {
        groupChatCode,
        senderId,
        senderEmployeeCode,
        receiverIdArr,
        receiverEmployeeCodeArr,
        type,
        content
    } = req.body;
    const timeNow = moment().format();
    const newData = new ChatMessage({
        groupChatCode,
        senderId,
        senderEmployeeCode,
        receiverIdArr,
        receiverEmployeeCodeArr,
        type,
        content,
        timeNow
    });
    newData.save()
        .then(data => res.status(201).json(resultCreate(data)))
        .catch(err => res.status(500).json(resultCreate(null, err)))
}
// ! unuse
module.exports.getData = (req, res, next) => {
    const condition = req.body.condition;
    const perPage = parseInt(req.body.limit || keys.LIMIT)
    const page = parseInt(req.body.page || 1)
    const skip = (page - 1) * perPage;
    ChatMessage.find(condition).sort({ _id: -1 }).skip(skip).limit(perPage)
        .then(async (data) => {
            const totalDocuments = await ChatMessage.find().sort({ _id: -1 }).countDocuments()
            const totalPage = Math.ceil(totalDocuments / perPage);
            const meta = {
                page,
                perPage,
                totalDocuments,
                totalPage,
            }
            res.status(200).json(resultGet(data, meta))
        })
        .catch(err => res.status(500).json(resultGet([], null, err)))
}
// ! unuse
module.exports.updateDataById = (req, res, next) => {
    const { id } = req.params;
    const {
        groupChatCode,
        senderId,
        senderEmployeeCode,
        receiverIdArr,
        receiverEmployeeCodeArr,
        type,
        content,
        isActive
    } = req.body;
    ChatMessage.findById(id)
        .then(data => {
            if (!data) return Promise.reject({
                status: 404, message: "Không tìm thấy dữ liệu"
            })
            data.groupChatCode = groupChatCode;
            data.senderId = senderId;
            data.senderEmployeeCode = senderEmployeeCode;
            data.receiverIdArr = receiverIdArr;
            data.receiverEmployeeCodeArr = receiverEmployeeCodeArr;
            data.type = type;
            data.content = content;
            data.isActive = isActive;
            data.updated = Date.now();
            return data.save()
        })
        .then(data => res.status(200).json(resultUpdate(data)))
        .catch(err => {
            if (err.status) return res.status(err.status).json(resultUpdate(null, err))
            return res.status(500).json(resultUpdate(null, err))
        })
}
// ! unuse
module.exports.getDataById = (req, res, next) => {
    const { id } = req.params;
    ChatMessage.findById(id)
        .then(data => res.status(200).json(resultGetById(data)))
        .catch(err => res.status(500).json(resultGetById(null, err)))
}
// ! unuse
module.exports.deleteDataById = (req, res, next) => {
    const { id } = req.params;
    ChatMessage.deleteOne({ _id: id })
        .then((result) => {
            if (result.n === 0) return Promise.reject({
                status: 404, message: "Không tìm thấy dữ liệu"
            })
            res.status(200).json(resultdelete([id]))
        })
        .catch(err => {
            if (err.status) return res.status(err.status).json(resultdelete([], err))

            return res.status(500).json(resultdelete([], err))
        })
}
// ! unuse
module.exports.activedDataById = (req, res, next) => {
    const { id } = req.params;
    ChatMessage.findOneAndUpdate({ _id: id }, { isActive: req.body.isActive }, { new: true, upsert: true })
        .then(result => res.status(200).json(resultActive(result)))
        .catch(err => {
            if (err.status) return res.status(err.status).json(resultActive(null, err))
            return res.status(500).json(resultActive(null, err))
        })
}
// ! unuse
module.exports.activedMany = (req, res, next) => {
    const { arrayId, isActive } = req.body;
    ChatMessage.updateMany({ _id: { $in: arrayId } }, { isActive: isActive })
        .then(async (result) => {
            if (result.n === 0) return Promise.reject({
                status: 404, message: "Không tìm thấy dữ liệu"
            })
            const data = await ChatMessage.find({ _id: { $in: arrayId } });
            res.status(200).json(resultActiveMany(data))
        })
        .catch(err => {
            if (err.status) return res.status(err.status).json(resultActiveMany([], err))
            return res.status(500).json(resultActiveMany([], err))
        })
}
// ! unuse
module.exports.deleteMany = (req, res, next) => {
    const { arrayId } = req.body;
    ChatMessage.deleteMany({ _id: { $in: arrayId } })
        .then(result => {
            if (result.n === 0) return Promise.reject({
                status: 404, message: "Không tìm thấy dữ liệu"
            })
            res.status(200).json(resultdelete(arrayId))
        })
        .catch(err => {
            if (err.status) return res.status(err.status).json(resultdelete([], err))
            return res.status(500).json(resultdelete([], err))
        })
}

module.exports.getLatestMessages = async (req, res, next) => {
    try {
        const { lastMessageId } = req.query;
        const userId = req.user.userId;
        let existChatGroup = await ChatGroup.find({
            'memberArr.userId': userId,
            isDelete: false
        }, 'code');
        existChatGroup = existChatGroup.map(item => item.code);

        const match = {
            groupChatCode: {
                $in: existChatGroup
            },
            isDelete: false,
            'receiverIdArr': mongoose.Types.ObjectId(userId)
        };
        if (lastMessageId) {
            let lastMessage = await ChatMessage.findById(lastMessageId);
            if (lastMessage) {
                match.created = { $lt: lastMessage.created };
            }
        }
        const result = await ChatMessage.aggregate(
            [
                { "$match": match },
                {
                    "$group": {
                        "_id": "$groupChatCode",
                        "doc": { "$last": "$$ROOT" }
                    }
                },
                { "$replaceRoot": { "newRoot": "$doc" } },
                { "$sort": { "created": -1 } },
                { "$limit": 10 }
            ]
        );

        const messages = await ChatMessage.populate(result, MessagePopulatePath.Default);
        return res.status(200).json(resultGet(messages));
    } catch (err) {
        console.log('socketChatMessage getNewest', err);
        if (err.status) return res.status(err.status).json(resultGet([], null, err))
        return res.status(500).json(resultGet([], null, err));
    }
}

module.exports.getForGroup = async (req, res, next) => {
    try {
        const { groupCode, lastMessageId } = req.query;
        const limit = !isNaN(req.query.limit) ? Number(req.query.limit) : 10;
        const match = {
            groupChatCode: groupCode,
            isDelete: false
        };
        if (lastMessageId) {
            let lastMessage = await ChatMessage.findById(lastMessageId);
            if (lastMessage) {
                match.created = { $lt: lastMessage.created };
            }
        }
        const messages = await ChatMessage.find(match)
            .populate(MessagePopulatePath.Default)
            .sort({ created: -1 })
            .limit(limit)
            .exec();
        return res.status(200).json(resultGet(messages, null));
    } catch (err) {
        return res.status(500).json(resultGet([], null, err));
    }
}