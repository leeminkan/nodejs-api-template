const chatEnums = require('../../../enums/chat');
const Joi = require('joi');
const validateSettings = require('../../../config/validate');

const createSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            "string.base": "CUSTOM_VALIDATE_GROUP_NAME_INVALID"
        }),
    type: Joi.valid(chatEnums.GROUP_TYPE.SINGLE, chatEnums.GROUP_TYPE.MULTIPE),
    memberArr: Joi.array()
        .min(1)
        .items(Joi.object({
            userId: Joi.string()
                .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
                .required(),
            employeeId: Joi.string()
                .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
                .required(),
            employeeCode: Joi.string()
                .required()
        }))
        .required()
});

const updateSchema = Joi.object({
    id: Joi.string()
        .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
        .required(),
    name: Joi.string()
        .messages({
            "string.base": "CUSTOM_VALIDATE_GROUP_NAME_INVALID"
        })
});

const deleteByIdSchema = Joi.object({
    id: Joi.string()
        .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
        .required()
});

const addMemberSchema = Joi.object({
    groupCode: Joi.string()
        .required(),
    users: Joi.array()
        .min(1)
        .items(Joi.object({
            userId: Joi.string()
                .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
                .required(),
            employeeId: Joi.string()
                .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
                .required(),
            employeeCode: Joi.string()
                .required()
        }))
        .required()
});

const removeMemberSchema = Joi.object({
    groupCode: Joi.string()
        .required(),
    userIds: Joi.array()
        .min(1)
        .items(
            Joi.string()
                .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
        )
        .required()
});

const getByCodeSchema = Joi.object({
    groupCode: Joi.string()
        .required()
});

const getByReceiverIdSchema = Joi.object({
    receiverId: Joi.string()
        .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
        .required()
});

const leaveGroupSchema = Joi.object({
    groupCode: Joi.string()
        .required()
});

module.exports = {
    createSchema,
    updateSchema,
    deleteByIdSchema,
    addMemberSchema,
    removeMemberSchema,
    getByCodeSchema,
    getByReceiverIdSchema,
    leaveGroupSchema
}