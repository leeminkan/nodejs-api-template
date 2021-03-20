const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const ServiceGroupSchema = new mongoose.Schema({
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
  userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User tạo
  userUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//User cập nhật
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  isDelete: { type: Boolean, default: false }
},
  { toJSON: { virtuals: true } }
)

ServiceGroupSchema.virtual('offices', {
  ref: 'Offices',
  localField: 'officesCode',
  foreignField: 'code',
  justOne: true
});



ServiceGroupSchema.virtual('parent', {
  ref: 'ServiceGroup',
  localField: 'parentCode',
  foreignField: 'code',
  justOne: true
});

const ServiceGroup = mongoose.model('ServiceGroup', ServiceGroupSchema, 'CAT_SERVICE_GROUP')

module.exports = {
  ServiceGroup, ServiceGroupSchema
}