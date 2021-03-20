module.exports = {
    // mongoose
    REGEX_VALIDATE_OBJECT_ID: /^[a-f\d]{24}$/i,
    DEFAULT_OPTIONS: {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    }
}