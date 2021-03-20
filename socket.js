
const keys = require('./config/index');
const socketEnums = require('./enums/socket');
const redisEnums = require('./enums/redis');
const redis = require("./redis");

const jwt = require('jsonwebtoken');
const moment = require('moment');

const chatGroupApiController = require('./routes/Controllers/CAT/chat_group/chatGroupSocket');

const chatMessageController = require('./routes/Controllers/DATA/chat_message/chatMessageSocket');

module.exports.socketAll = (io) => {

    io.use((socket, next) => {
        // Authenticate user with token
        if (socket.handshake.query && socket.handshake.query[socketEnums.ACCESS_TOKEN]) {
            jwt.verify(socket.handshake.query[socketEnums.ACCESS_TOKEN], keys.SECRET_KEY, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                return next();
            });
        }
        else {
            return next(new Error('Authentication error'));
        }
    }).on(socketEnums.EVENT.CONNECTION, async (socket) => { // hàm on connection chạy sau hàm on connect (sau khi đã kết nối)
        try {
            const decoded = socket.decoded;
            console.log("*** New user connect: ", socket.decoded);

            // Save to online users array
            await redis.hdel(
                redisEnums.OFFLINE_USERS,
                decoded.userId
            );

            const currentUserValue = await redis.hgetAsync(redisEnums.ONLINE_USERS, decoded.userId);
            let value = JSON.stringify({ employeeCode: decoded.employeeCode, socketIds: [socket.id] })
            if (currentUserValue) {
                const parseValue = JSON.parse(currentUserValue);
                if (parseValue.socketIds.indexOf(socket.id)) {
                    parseValue.socketIds.push(socket.id);
                    value = JSON.stringify(parseValue);
                }
            }
            await redis.hmsetAsync([
                redisEnums.ONLINE_USERS,
                decoded.userId,
                value
            ]);

            redis.hkeysAsync(redisEnums.ONLINE_USERS).then((value) => {
                console.log("onlineUsers: ", value);
                // emit online users
                socket.emit(socketEnums.EVENT.SSC_ONLINE_USERS, value);
            });

            redis.hgetallAsync(redisEnums.OFFLINE_USERS).then((value) => {
                console.log("offlineUsers: ", value);
                // emit offline users
                let arr = [];
                if (value)
                    for (const [key, data] of Object.entries(value)) {
                        arr.push(JSON.parse(data));
                    }
                socket.emit(socketEnums.EVENT.SSC_OFFLINE_USERS, arr);
            });

            // broadcast new user connect
            io.emit(socketEnums.EVENT.SSC_USER_CONNECT, socket.decoded.userId);

            // Join all room
            const rooms = await chatGroupApiController.getAllByUserId(decoded.userId);
            socket.emit(socketEnums.EVENT.SSC_ROOM_LISTS, rooms);
            if (rooms && rooms.length > 0) {
                rooms.forEach((item) => {
                    console.log("join room", item.code);
                    socket.join(item.code);
                });
            }

            socket.on(socketEnums.EVENT.CSS_SEND_MESSAGE, async ({ room, message }) => {
                console.log("chat message", { room, message });
                if (room && message && socket.rooms.has(room)) {
                    // Save message
                    const chatMessage = await chatMessageController.createDataBySocket(room, message, socket.decoded);
                    // Emit to room
                    io.to(room).emit(socketEnums.EVENT.SSC_SEND_NEW_MESSAGE, { room, message: chatMessage });
                }
            });

            socket.on(socketEnums.EVENT.CSS_USER_TYPING, async ({ room, data: { userId, isTyping } }) => {
                console.log("user typing message", { room, data: { userId, isTyping } });
                // Emit to room
                io.to(room).emit(socketEnums.EVENT.SSC_USER_TYPING, { room, data: { userId, isTyping } });
            });

            socket.on(socketEnums.EVENT.CSS_USER_SEEN_MESSAGE, async ({ room, messageIds }) => {
                console.log(socketEnums.EVENT.CSS_USER_SEEN_MESSAGE, { room, messageIds });
                // update messages
                const messages = await chatMessageController.updateViewer(
                    messageIds,
                    socket.decoded
                );
                // TODO: Should remove data unuse like: user, messageIds
                // Emit to room
                io.to(room).emit(socketEnums.EVENT.SSC_USER_SEEN_MESSAGE, {
                    room, data: {
                        messages,
                        user: socket.decoded,
                        messageIds
                    }
                });
            });

            // Runs when client disconnects
            socket.on(socketEnums.EVENT.DISCONNECT, async () => {
                if (socket.decoded) {
                    console.log('*** User disconnect', socket.decoded.userName);
                    const currentUserValue = await redis.hgetAsync(redisEnums.ONLINE_USERS, decoded.userId);
                    if (currentUserValue) {
                        // delete from socketIds in onlineUser
                        const parseValue = JSON.parse(currentUserValue);
                        if (parseValue.socketIds.length > 1) {
                            parseValue.socketIds = parseValue.socketIds.filter(item => item !== socket.id);
                            let value = JSON.stringify(parseValue);
                            await redis.hmsetAsync([
                                redisEnums.ONLINE_USERS,
                                decoded.userId,
                                value
                            ]);
                            return;
                        }
                    }

                    await redis.hdel(
                        redisEnums.ONLINE_USERS,
                        decoded.userId
                    );

                    // Save to offline users array
                    let time = moment();
                    await redis.hmsetAsync([
                        redisEnums.OFFLINE_USERS,
                        decoded.userId,
                        JSON.stringify({
                            userId: decoded.userId,
                            employeeCode: decoded.employeeCode,
                            time: time.format(),
                            timestamp: time.unix(),
                        })
                    ]);

                    // broadcast user disconnect
                    io.emit(socketEnums.EVENT.SSC_USER_DISCONNECT, {
                        userId: decoded.userId,
                        employeeCode: decoded.employeeCode,
                        time: time.format(),
                        timestamp: time.unix()
                    });
                }
            });
        } catch (e) {
            console.log(e.message);
        }
    });
};
