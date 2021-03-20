const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema({
        value : {type: String, trim:true, required: true},
        date_str : {type: Number, required: true},
        isWorking: {type: Boolean, default: false}
    })
const Calendar = mongoose.model('Calendar', CalendarSchema, 'CAT_CALENDAR')

module.exports = {
    Calendar, CalendarSchema
}