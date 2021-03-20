module.exports = {
    EVENT: {
        CONNECTION: "connection",
        DISCONNECT: "disconnect",
        SSC_ONLINE_USERS: "SSC_ONLINE_USERS",
        SSC_OFFLINE_USERS: "SSC_OFFLINE_USERS",
        SSC_USER_CONNECT: "SSC_USER_CONNECT",
        SSC_USER_DISCONNECT: "SSC_USER_DISCONNECT",
        SSC_ROOM_LISTS: "SSC_ROOM_LISTS",
        SSC_SEND_NEW_MESSAGE: "SSC_SEND_NEW_MESSAGE",
        CSS_SEND_MESSAGE: "CSS_SEND_MESSAGE",
        CSS_USER_TYPING: "CSS_USER_TYPING",
        SSC_USER_TYPING: "SSC_USER_TYPING",
        CSS_USER_SEEN_MESSAGE: "CSS_USER_SEEN_MESSAGE",
        SSC_USER_SEEN_MESSAGE: "SSC_USER_SEEN_MESSAGE",
        SSC_USER_JOIN_ROOM: "SSC_USER_JOIN_ROOM", // Gửi cho room khi có người join room
        SSC_USER_REMOVED_FROM_ROOM: "SSC_USER_REMOVED_FROM_ROOM", // Gửi cho người out room (bị kick)
        SSC_USER_LEFT_ROOM: "SSC_USER_LEFT_ROOM", // Gửi cho room hiện tại (trừ người out) khi có người leave room
        SSC_CHAT_GROUP_REMOVED: "SSC_CHAT_GROUP_REMOVED", // Gửi đến user trong room hiện tại khi room bị xóa
    },
    ACCESS_TOKEN: "accessToken"
}