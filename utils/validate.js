const i18n = require('i18n');
const validateSettings = require('../config/validate');

const buildUsefulErrorObject = (errors) => {
    const usefulErrors = {};
    errors.map(e => {
        let message = e.message;
        if (e.message.includes("CUSTOM_VALIDATE")) {
            message = i18n.__(message);
        } else {
            message = i18n.__(`VALIDATE_${e.type.replace(/\./g, '_').toUpperCase()}`);
            if (message.includes("%PARAM_1%")) {
                message = message.replace("%PARAM_1%", e.context.label);
            }

            if (message.includes("%PARAM_2%")) {
                if (e.type.includes('min') || e.type.includes('max')) {
                    message = message.replace("%PARAM_2%", e.context.limit);
                } else if (e.type.includes('only')) {
                    message = message.replace("%PARAM_2%", e.context.valids.join(", "));
                }
            }
        }

        if (!usefulErrors.hasOwnProperty(e.path.join('_'))) {
            usefulErrors[e.path.join('_')] = {
                message,
                path: e.path,
                type: e.type
            };
        }
    });

    return usefulErrors;
};

const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const { error, value } = schema.validate({ ...req.body, ...req.params, ...req.query }, validateSettings.DEFAULT_OPTIONS);

            if (error) {
                const usefulErrors = buildUsefulErrorObject(error.details);
                return res.status(400).json({ error: usefulErrors });
            } else {
                req.body = value;
                return next();
            }
        } catch (error) {
            console.log(`Error: utils validate`, error);
            return res.status(500).json({ error: "Some thing was wrong!" });
        }
    }
}

module.exports = {
    buildUsefulErrorObject,
    validate
};