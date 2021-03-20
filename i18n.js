const i18n = require('i18n');

module.exports.i18nInit = (app) => {
    i18n.configure({

        //define how many languages we would support in our application
        locales: ['en', 'vi'],

        //define the path to language json files, default is /locales
        directory: __dirname + '/locales',

        //define the default language
        defaultLocale: 'vi',
    });

    app.use(i18n.init);
}