module.exports = {
    GROUP_TYPE: {
        SINGLE: "single",
        MULTIPE: "multiple"
    },
    MESSAGE_TYPE: {
        TEXT: "text",
        IMAGE: "image"
    },
    MESSAGE_EVENT: {
        CREATE_GROUP: {
            NAME: "CREATE_GROUP",
            TEMPLATE: {
                CONTENT: "Nhóm '%GROUP_NAME%' đã được tạo",
                ATTRIBUTES: {
                    GROUP_NAME: "GROUP_NAME"
                }
            }
        },
        ADD_MEMBER: {
            NAME: "ADD_MEMBER",
            TEMPLATE: {
                CONTENT: "%USER% đã thêm %ADDED_USER% vào nhóm",
                ATTRIBUTES: {
                    USER: "USER",
                    ADDED_USER: "ADDED_USER",
                }
            }
        },
        REMOVE_MEMBER: {
            NAME: "REMOVE_MEMBER",
            TEMPLATE: {
                CONTENT: "%USER% đã mời %REMOVED_USER% ra khỏi nhóm",
                ATTRIBUTES: {
                    USER: "USER",
                    REMOVED_USER: "REMOVED_USER",
                }
            }
        },
        MEMBER_LEAVE: {
            NAME: "MEMBER_LEAVE",
            TEMPLATE: {
                CONTENT: "%USER% đã rời khỏi nhóm",
                ATTRIBUTES: {
                    USER: "USER"
                }
            }
        }
    }
}