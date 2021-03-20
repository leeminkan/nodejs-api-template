const { ChatGroup, ChatGroupPopulatePath } = require('../../../../models/CAT/ChatGroup');
const { ChatMessage, MessagePopulatePath } = require('../../../../models/DATA/ChatMessage');
const { User } = require('../../../../models/AUTH/User');
const keys = require('../../../../config/index');
const { resultGet, resultGetById, resultCreate, resultUpdate, resultActive, resultActiveMany, resultdelete } = require('../../../../utils/message');
const chatEnums = require('../../../../enums/chat');
const socketEnums = require('../../../../enums/socket');
const redisEnums = require('../../../../enums/redis');
const redis = require("../../../../redis");
const { makeid } = require('../../../../utils/functions');
const firebaseAdmin = require("../../../..//services/firebaseAdmin");

async function makeIdAndCheck(length) {
  let result = makeid(length);
  const exist = await ChatGroup.findOne({
    code: result
  });
  if (exist) return await makeid(length);
  return result;
}

module.exports.createData = async (req, res, next) => {
  try {
    const { name, memberArr, type } = req.body;

    // change isMain memberArr to false
    memberArr.forEach((element, index) => {
      if (element.isMain) {
        memberArr[index].isMain = false;
      }
    });

    //push user main to memberArr
    let index = memberArr.findIndex(item => item.userId === req.user.userId);
    if (index >= 0) {
      memberArr[index] = {
        userId: req.user.userId,
        employeeId: req.user.employeeId,
        employeeCode: req.user.employeeCode,
        isMain: true
      }
    } else {
      memberArr.unshift({
        userId: req.user.userId,
        employeeId: req.user.employeeId,
        employeeCode: req.user.employeeCode,
        isMain: true
      });
    }

    const code = await makeIdAndCheck(8);
    const newData = new ChatGroup({
      code,
      name,
      memberArr,
      type,
      userCreate: req.user.userId
    })
    await newData.save()
      .then(result => result.populate(ChatGroupPopulatePath.Default)
        .execPopulate());

    const receivers = {
      employeeCodes: [],
      userIds: []
    };

    newData.memberArr.forEach(member => {
      redis.hgetAsync(redisEnums.ONLINE_USERS, String(member.userId._id)).then((value) => {
        if (!value) return;
        const parseValue = JSON.parse(value);
        parseValue.socketIds.forEach(item => {
          req.io.sockets.sockets.get(item).join(code);
        });
      });
      receivers.userIds.push(member.userId);
      receivers.employeeCodes.push(member.employeeCode);
    });

    const eventCreateGroup = chatEnums.MESSAGE_EVENT.CREATE_GROUP;
    const message = new ChatMessage({
      groupChatCode: code,
      senderId: req.user.userId,
      senderEmployeeCode: req.user.employeeCode,
      receiverIdArr: receivers.userIds,
      receiverEmployeeCodeArr: receivers.employeeCodes,
      type: chatEnums.MESSAGE_TYPE.TEXT,
      content: eventCreateGroup.TEMPLATE.CONTENT.replace(
        `%${eventCreateGroup.TEMPLATE.ATTRIBUTES.GROUP_NAME}%`, name
      ),
      forEvent: eventCreateGroup.NAME,
      isSystemNotification: true
    });

    await message.save()
      .then(result => result.populate(MessagePopulatePath.Default)
        .execPopulate());

    req.io.to(code).emit(socketEnums.EVENT.SSC_SEND_NEW_MESSAGE, { room: code, message });
    firebaseAdmin.sendMessageToDevice(message);

    return res.status(201).json(resultCreate({ ...newData.toObject(), messages: [message] }));
  } catch (error) {
    console.log('chatGroupController createData', error);
    if (error.status) return res.status(error.status).json(resultCreate(null, error));
    return res.status(500).json(resultCreate(null, error));
  }
}
// ! unuse
module.exports.getData = (req, res, next) => {
  const condition = req.body.condition;
  const perPage = parseInt(req.body.limit || keys.LIMIT)
  const page = parseInt(req.body.page || 1)
  const skip = (page - 1) * perPage;
  ChatGroup.find(condition).sort({ _id: -1 }).skip(skip).limit(perPage)
    .then(async (data) => {
      const totalDocuments = await ChatGroup.find().sort({ _id: -1 }).countDocuments()
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

module.exports.updateDataById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const data = await ChatGroup.findOne({
      _id: id,
      isDelete: false
    });

    if (!data) throw {
      status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
    }

    const isMain = data.memberArr.find(item => {
      return item.userId.toString() === req.user.userId && item.isMain
    });

    if (!isMain) throw {
      status: 400, message: req.__("MESSAGE_NOT_PERMISSION")
    }

    data.name = name;
    data.userUpdate = req.user.userId;
    data.updated = Date.now();

    await data.save()
      .then(result => result.populate(ChatGroupPopulatePath.Default)
        .execPopulate());

    return res.status(200).json(resultUpdate(data));
  } catch (error) {
    console.log('chatGroupController updateDataById', error);
    if (error.status) return res.status(error.status).json(resultUpdate(null, error));
    return res.status(500).json(resultUpdate(null, error));
  }
}
// ! unuse
module.exports.getDataById = (req, res, next) => {
  const { id } = req.params;
  ChatGroup.findById(id)
    .then(data => res.status(200).json(resultGetById(data)))
    .catch(err => res.status(500).json(resultGetById(null, err)))
}

module.exports.deleteDataById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chatGroup = await ChatGroup.findOne({
      _id: id,
      isDelete: false
    });

    // Check something before delete
    if (!chatGroup) throw {
      status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
    }

    const isMain = chatGroup.memberArr.find(item => {
      return item.userId.toString() === req.user.userId && item.isMain
    });

    if (!isMain) throw {
      status: 400, message: req.__("MESSAGE_NOT_PERMISSION")
    }

    const userUpdate = req.user.userId
    const updated = Date.now();
    // soft delete
    chatGroup.isDelete = true;
    chatGroup.userUpdate = userUpdate;
    chatGroup.updated = updated;
    await chatGroup.save();

    // emit to client event EVENT.SSC_CHAT_GROUP_REMOVED
    req.io.to(chatGroup.code).emit(socketEnums.EVENT.SSC_CHAT_GROUP_REMOVED, { room: chatGroup.code });
    const clients = req.io.sockets.adapter.rooms.get(chatGroup.code);
    if (clients) {
      clients.forEach((key, value, set) => {
        req.io.sockets.sockets.get(value).leave(chatGroup.code);
      });
    }

    return res.status(200).json(resultdelete([id]));
  } catch (error) {
    console.log('chatGroupController deleteDataById', error);
    if (error.status) return res.status(error.status).json(resultdelete([], error));
    return res.status(500).json(resultdelete([], error));
  }
}
// ! unuse
module.exports.activedDataById = (req, res, next) => {
  const { id } = req.params;
  ChatGroup.findOneAndUpdate({ _id: id }, { isActive: req.body.isActive }, { new: true, upsert: true })
    .populate({ path: 'info_unit', select: 'code name' })
    .then(result => res.status(200).json(resultActive(result)))
    .catch(err => {
      if (err.status) return res.status(err.status).json(resultActive(null, err))
      return res.status(500).json(resultActive(null, err))
    })
}
// ! unuse
module.exports.activedMany = (req, res, next) => {
  const { arrayId, isActive } = req.body;
  ChatGroup.updateMany({ _id: { $in: arrayId } }, { isActive: isActive })
    .then(async (result) => {
      if (result.n === 0) return Promise.reject({
        status: 404, message: "Không tìm thấy dữ liệu"
      })
      const data = await ChatGroup.find({ _id: { $in: arrayId } }).populate({ path: 'info_unit', select: 'code name' });
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
  ChatGroup.deleteMany({ _id: { $in: arrayId } })
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
// ! unuse
module.exports.deleteAll = (req, res, next) => {
  ChatGroup.deleteMany({})
    .then(result => {
      if (result.n === 0) return Promise.reject({
        status: 404, message: "Không tìm thấy dữ liệu"
      })
      res.status(200).json(resultdelete([1]))
    })
    .catch(err => {
      if (err.status) return res.status(err.status).json(resultdelete([], err))
      return res.status(500).json(resultdelete([1], err))
    })

  ChatMessage.deleteMany({})
    .then(result => {
      if (result.n === 0) return Promise.reject({
        status: 404, message: "Không tìm thấy dữ liệu"
      })
      res.status(200).json(resultdelete([]))
    })
    .catch(err => {
      if (err.status) return res.status(err.status).json(resultdelete([], err))
      return res.status(500).json(resultdelete([], err))
    })
}

module.exports.getChatGroupByCode = async (req, res, next) => {
  try {
    const { groupCode } = req.query;
    const limit = !isNaN(req.query.limit) ? Number(req.query.limit) : 10;
    const data = await ChatGroup.findOne({
      code: groupCode,
      'memberArr.userId': req.user.userId,
      isDelete: false
    })
      .populate(ChatGroupPopulatePath.Default);

    if (!data) throw {
      status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
    }

    const messages = await ChatMessage.find({ groupChatCode: groupCode, isDelete: false })
      .populate(MessagePopulatePath.Default)
      .sort({ created: -1 })
      .limit(limit);

    return res.status(200).json(resultGetById({ ...data.toObject(), messages }));
  } catch (error) {
    console.log('chatGroupController getChatGroupByCode', error);
    if (error.status) return res.status(error.status).json(resultGetById(null, error));
    return res.status(500).json(resultGetById(null, error));
  }
}

module.exports.getChatGroupByReceiverId = async (req, res, next) => {
  try {
    const { receiverId } = req.query;
    const limit = !isNaN(req.query.limit) ? Number(req.query.limit) : 10;
    let data = await ChatGroup.findOne({
      'memberArr.userId': {
        "$all": [receiverId, req.user.userId]
      },
      'type': chatEnums.GROUP_TYPE.SINGLE,
      isDelete: false
    }).populate(ChatGroupPopulatePath.Default);

    if (!data) {
      const user = await User.findById(req.user.userId).populate('profile');
      const receiver = await User.findById(receiverId).populate('profile');
      if (!user || !receiver) throw {
        status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
      }
      const code = await makeIdAndCheck(8);
      data = new ChatGroup({
        code,
        name: `${user.profile.lastName} and ${receiver.profile.lastName}`,
        memberArr: [{
          userId: user._id,
          employeeId: user.profile._id,
          employeeCode: user.employeeCode,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          isMain: true,
        }, {
          userId: receiver._id,
          employeeId: receiver.profile._id,
          employeeCode: receiver.employeeCode,
          name: `${receiver.profile.firstName} ${receiver.profile.lastName}`,
          isMain: false,
        }],
        type: chatEnums.GROUP_TYPE.SINGLE,
        userCreate: req.user.userId
      })
      await data.save()
        .then(result => result.populate(ChatGroupPopulatePath.Default)
          .execPopulate());
      data.memberArr.forEach(member => {
        redis.hgetAsync(redisEnums.ONLINE_USERS, String(member.userId._id)).then((value) => {
          if (!value) return;
          const parseValue = JSON.parse(value);
          parseValue.socketIds.forEach(item => {
            req.io.sockets.sockets.get(item).join(code);
          });
        });
      });
    }

    const messages = await ChatMessage.find({ groupChatCode: data.code, isDelete: false })
      .populate(MessagePopulatePath.Default)
      .sort({ created: -1 })
      .limit(limit);
    return res.status(200).json(resultGetById({ ...data.toObject(), messages }));
  } catch (error) {
    console.log('chatGroupController getChatGroupByReceiverId', error);
    if (error.status) return res.status(error.status).json(resultGetById(null, error));
    return res.status(500).json(resultGetById(null, error));
  }
}

module.exports.addMember = async (req, res, next) => {
  try {
    const { groupCode, users } = req.body;
    const chatGroup = await ChatGroup.findOne({
      code: groupCode,
      isDelete: false
    });

    if (!chatGroup) throw {
      status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
    }

    const isMain = chatGroup.memberArr.find(item => {
      return item.userId.toString() === req.user.userId && item.isMain
    });

    if (!isMain) throw {
      status: 400, message: req.__("MESSAGE_NOT_PERMISSION")
    }

    const receivers = {
      employeeCodes: [],
      userIds: []
    };

    const target = {
      employeeCodes: [],
      userIds: []
    };

    let addedUsers = users.filter(item => {
      receivers.userIds.push(item.userId);
      receivers.employeeCodes.push(item.employeeCode);
      if (!chatGroup.memberArr.find(member => member.userId.toString() === item.userId)) {
        target.userIds.push(item.userId);
        target.employeeCodes.push(item.employeeCode);
        return true;
      }
      return false;
    });

    if (addedUsers.length < 1) throw {
      status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
    }

    chatGroup.memberArr = [...chatGroup.memberArr, ...addedUsers];
    chatGroup.userUpdate = req.user.userId;
    chatGroup.updated = Date.now();

    await chatGroup.save()
      .then(result => result.populate(ChatGroupPopulatePath.Default)
        .execPopulate());

    // * Create message "Đã thêm vào group chat"
    const addedUserProfiles = [];

    chatGroup.memberArr.forEach(member => {
      redis.hgetAsync(redisEnums.ONLINE_USERS, String(member.userId._id)).then((value) => {
        if (!value) return;
        const parseValue = JSON.parse(value);
        // * Join user to room socket
        parseValue.socketIds.forEach(item => {
          req.io.sockets.sockets.get(item).join(chatGroup.code);
        });
      });
      if (addedUsers.find(item => item.userId === member.userId._id.toString())) {
        addedUserProfiles.push(member);
      }
    });

    const eventAddMember = chatEnums.MESSAGE_EVENT.ADD_MEMBER;
    let content = eventAddMember.TEMPLATE.CONTENT;
    let addedUser = "";
    for (i = 0; i < addedUserProfiles.length; i++) {
      if (i == 0) {
        addedUser += `${addedUserProfiles[i].employeeId.lastName}`;
      } else if (i === addedUserProfiles.length - 1) {
        addedUser += ` và ${addedUserProfiles[i].employeeId.lastName}`;
      } else {
        addedUser += `, ${addedUserProfiles[i].employeeId.lastName}`;
      }
    }
    content = content.replace(`%${eventAddMember.TEMPLATE.ATTRIBUTES.USER}%`, req.user.name);
    content = content.replace(`%${eventAddMember.TEMPLATE.ATTRIBUTES.ADDED_USER}%`, addedUser);


    const message = new ChatMessage({
      groupChatCode: chatGroup.code,
      senderId: req.user.userId,
      senderEmployeeCode: req.user.employeeCode,
      receiverIdArr: receivers.userIds,
      receiverEmployeeCodeArr: receivers.employeeCodes,
      targetIdArr: target.userIds,
      targetEmployeeCodeArr: target.employeeCodes,
      type: chatEnums.MESSAGE_TYPE.TEXT,
      content,
      forEvent: eventAddMember.NAME,
      isSystemNotification: true
    });

    await message.save()
      .then(result => result.populate(MessagePopulatePath.Default)
        .execPopulate());
    // * Emit message to room
    req.io.to(chatGroup.code).emit(socketEnums.EVENT.SSC_SEND_NEW_MESSAGE, { room: chatGroup.code, message });
    // * Emit user join room
    req.io.to(chatGroup.code).emit(socketEnums.EVENT.SSC_USER_JOIN_ROOM, { data: chatGroup });
    return res.status(200).json(resultUpdate(chatGroup));
  } catch (err) {
    console.log("Error: chatGroupController.addUser", err);
    if (err.status) return res.status(err.status).json(resultUpdate(null, err));
    return res.status(500).json(resultUpdate(null, err));
  }
}

module.exports.removeMember = async (req, res, next) => {
  try {
    const { groupCode, userIds } = req.body;
    const chatGroup = await ChatGroup.findOne({
      code: groupCode,
      isDelete: false
    });

    if (!chatGroup) throw {
      status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
    }

    const isMain = chatGroup.memberArr.find(item => {
      return item.userId.toString() === req.user.userId && item.isMain
    });

    if (!isMain) throw {
      status: 400, message: req.__("MESSAGE_NOT_PERMISSION")
    }

    const receivers = {
      employeeCodes: [],
      userIds: []
    };

    const target = {
      employeeCodes: [],
      userIds: []
    };

    let filterMembers = chatGroup.memberArr.filter(item => {
      receivers.userIds.push(item.userId);
      receivers.employeeCodes.push(item.employeeCode);
      if (!userIds.includes(item.userId.toString())) return true;
      target.userIds.push(item.userId);
      target.employeeCodes.push(item.employeeCode);
      return false;
    });

    chatGroup.memberArr = filterMembers;
    chatGroup.userUpdate = req.user.userId;
    chatGroup.updated = Date.now();

    await chatGroup.save()
      .then(result => result.populate(ChatGroupPopulatePath.Default)
        .execPopulate());

    // * Tạo message "Đã bị xóa khỏi group chat"
    const removedUserProfile = await User.find({
      _id: {
        $in: userIds
      }
    }).populate("profile");

    const eventRemoveMember = chatEnums.MESSAGE_EVENT.REMOVE_MEMBER;
    let content = eventRemoveMember.TEMPLATE.CONTENT;
    let removedUser = "";
    for (i = 0; i < removedUserProfile.length; i++) {
      // leave room
      redis.hgetAsync(redisEnums.ONLINE_USERS, String(removedUserProfile[i]._id)).then((value) => {
        if (!value) return;
        const parseValue = JSON.parse(value);
        parseValue.socketIds.forEach(item => {
          req.io.sockets.sockets.get(item).leave(chatGroup.code);
          // * Emit user removed to removedUser
          req.io.to(item).emit(socketEnums.EVENT.SSC_USER_REMOVED_FROM_ROOM, { room: chatGroup.code });
        });
      });
      // make content message
      if (i == 0) {
        removedUser += `${removedUserProfile[i].profile.lastName}`;
      } else if (i === removedUserProfile.length - 1) {
        removedUser += ` và ${removedUserProfile[i].profile.lastName}`;
      } else {
        removedUser += `, ${removedUserProfile[i].profile.lastName}`;
      }
    }
    content = content.replace(`%${eventRemoveMember.TEMPLATE.ATTRIBUTES.USER}%`, req.user.name);
    content = content.replace(`%${eventRemoveMember.TEMPLATE.ATTRIBUTES.REMOVED_USER}%`, removedUser);

    const message = new ChatMessage({
      groupChatCode: chatGroup.code,
      senderId: req.user.userId,
      senderEmployeeCode: req.user.employeeCode,
      receiverIdArr: receivers.userIds,
      receiverEmployeeCodeArr: receivers.employeeCodes,
      targetIdArr: target.userIds,
      targetEmployeeCodeArr: target.employeeCodes,
      type: chatEnums.MESSAGE_TYPE.TEXT,
      content,
      forEvent: eventRemoveMember.NAME,
      isSystemNotification: true
    });

    await message.save()
      .then(result => result.populate(MessagePopulatePath.Default)
        .execPopulate());
    // * Emit message to room
    req.io.to(chatGroup.code).emit(socketEnums.EVENT.SSC_SEND_NEW_MESSAGE, { room: chatGroup.code, message });
    // * Emit user left to room
    req.io.to(chatGroup.code).emit(socketEnums.EVENT.SSC_USER_LEFT_ROOM, { data: chatGroup });
    return res.status(200).json(resultUpdate(chatGroup));
  } catch (err) {
    console.log("Error: chatGroupController.removeUser", err);
    if (err.status) return res.status(err.status).json(resultUpdate(null, err))
    return res.status(500).json(resultUpdate(null, err));
  }
}

module.exports.leaveGroup = async (req, res, next) => {
  try {
    const { groupCode } = req.body;

    const chatGroup = await ChatGroup.findOne({
      code: groupCode,
      'memberArr.userId': req.user.userId,
      isDelete: false
    });

    if (!chatGroup) throw {
      status: 404, message: req.__("MESSAGE_DATA_NOT_FOUND")
    }

    const receivers = {
      employeeCodes: [],
      userIds: []
    };
    let isMain = false;
    let countIsMain = 0;
    let filterMembers = chatGroup.memberArr.filter(item => {
      // push to receiver message
      receivers.userIds.push(item.userId);
      receivers.employeeCodes.push(item.employeeCode);
      if (item.isMain) {
        countIsMain = countIsMain + 1;
        if (item.userId.toString() === req.user.userId) {
          isMain = true;
        }
      }
      return item.userId.toString() !== req.user.userId
    });

    if (isMain && countIsMain <= 1) {
      filterMembers[0].isMain = true
    }

    chatGroup.memberArr = filterMembers;
    chatGroup.userUpdate = req.user.userId;
    chatGroup.updated = Date.now();

    await chatGroup.save()
      .then(result => result.populate(ChatGroupPopulatePath.Default)
        .execPopulate());

    // * Tạo message "Ai đó đã rời khỏi nhóm"
    // leave room
    redis.hgetAsync(redisEnums.ONLINE_USERS, String(req.user.userId)).then((value) => {
      if (!value) return;
      const parseValue = JSON.parse(value);
      parseValue.socketIds.forEach(item => {
        req.io.sockets.sockets.get(item).leave(chatGroup.code);
      });
    });

    const eventMemberLeave = chatEnums.MESSAGE_EVENT.MEMBER_LEAVE;
    let content = eventMemberLeave.TEMPLATE.CONTENT;
    content = content.replace(`%${eventMemberLeave.TEMPLATE.ATTRIBUTES.USER}%`, req.user.name);
    const message = new ChatMessage({
      groupChatCode: chatGroup.code,
      senderId: req.user.userId,
      senderEmployeeCode: req.user.employeeCode,
      receiverIdArr: receivers.userIds,
      receiverEmployeeCodeArr: receivers.employeeCodes,
      type: chatEnums.MESSAGE_TYPE.TEXT,
      content,
      forEvent: eventMemberLeave.NAME,
      isSystemNotification: true
    });

    await message.save()
      .then(result => result.populate(MessagePopulatePath.Default)
        .execPopulate());
    // * Emit message to room
    req.io.to(chatGroup.code).emit(socketEnums.EVENT.SSC_SEND_NEW_MESSAGE, { room: chatGroup.code, message });
    // * Emit user left to room
    req.io.to(chatGroup.code).emit(socketEnums.EVENT.SSC_USER_LEFT_ROOM, { data: chatGroup });
    return res.status(200).json({
      message: "Rời khỏi nhóm thành công"
    });
  } catch (err) {
    console.log("Error: chatGroupController.removeUser", err);
    if (err.status) return res.status(err.status).json(resultUpdate(null, err))
    return res.status(500).json(resultUpdate(null, err));
  }
}

module.exports.getRedisSocketInfo = async (req, res, next) => {
  try {
    const onlineUsers = await redis.hkeysAsync(redisEnums.ONLINE_USERS);
    const value = await redis.hgetallAsync(redisEnums.OFFLINE_USERS);
    let offlineUsers = [];
    if (value)
      for (const [key, data] of Object.entries(value)) {
        offlineUsers.push(JSON.parse(data));
      }
    console.log("req.io.sockets.adapter.sids", req.io.sockets.adapter.sids);
    console.log("req.io.sockets.adapter.rooms: ", req.io.sockets.adapter.rooms);
    return res.status(200).json({
      onlineUsers,
      offlineUsers,
      sockets: [Object.fromEntries(req.io.sockets.adapter.rooms)]
    });
  } catch (error) {
    console.log("Error: chatGroupController.getRedisInfo", error);
    if (err.status) return res.status(err.status).json({ error })
    return res.status(500).json({ error });
  }

}