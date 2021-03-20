const Joi = require('joi');
const validateSettings = require('../../../config/validate');

const getLatestMessagesSchema = Joi.object({
    lastMessageId: Joi.string()
        .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
});

const getForGroupSchema = Joi.object({
    groupCode: Joi.string()
        .required(),
    lastMessageId: Joi.string()
        .regex(validateSettings.REGEX_VALIDATE_OBJECT_ID)
});

module.exports = {
    getLatestMessagesSchema,
    getForGroupSchema
}