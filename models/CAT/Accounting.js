const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const AccountingSchema = new mongoose.Schema({
    code: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    slug: { type: String, slug: "name" },
    parentCode: { type: String, required: true, default: "root" }, // root= danh muc goc
    officesCode: {
        type: String,
        trim: true,
        ref: 'Offices',
        default: '*'
    },
    isActive: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false }
},
    { toJSON: { virtuals: true } }
)

AccountingSchema.virtual('offices', {
    ref: 'Offices',
    localField: 'officesCode',
    foreignField: 'code',
    justOne: true
});

const Accounting = mongoose.model('Accounting', AccountingSchema, 'CAT_ACCOUNTING')

module.exports = {
    Accounting, AccountingSchema
}