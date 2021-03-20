const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { promisify } = require('util'); // built-in nodejs


const UserSchema = new mongoose.Schema({
  email: { type: String, trim: true },
  userName: { type: String, trim: true, required: true },
  password: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: false },
  userType: { type: String, trim: true, default: "client" }, //root : Toàn quyền | admin: quản trị viên | client
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  employeeCode: {
    type: String,
    trim: true,
    ref: 'Employee'
  },
  officesCode: {
    type: String,
    trim: true,
    ref: 'Offices',
    default: '*'
  },
  softwareCode: {
    type: String,
    trim: true,
    ref: 'Software',
    default: '*'
  },
  deviceToken: { type: String, default: '' },
  devices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    }
  ],
  isDelete: { type: Boolean, default: false }
},
  { toJSON: { virtuals: true } }
);
UserSchema.virtual('profile', {
  ref: 'Employee',
  localField: 'employeeCode',
  foreignField: 'code',
  justOne: true
});
UserSchema.virtual('offices', {
  ref: 'Offices',
  localField: 'officesCode',
  foreignField: 'code',
  justOne: true
});
UserSchema.virtual('software', {
  ref: 'Software',
  localField: 'softwareCode',
  foreignField: 'code',
  justOne: true
});

UserSchema.virtual('permissionArr', {
  ref: 'UserPermission',
  localField: '_id',
  foreignField: 'userId',
  justOne: false
});


const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);

UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  genSalt(10)
    .then(salt => {
      return hash(user.password, salt)
    })
    .then(hash => {
      user.password = hash;
      next();
    })
})


const SimpleUserPopulatePath = {
  path: "userCreate",
  select: '_id employeeCode',
  populate: {
    path: "profile",
    select: '_id firstName lastName fileAvatar',
    populate: {
      path: "fileAvatar"
    }
  }
}

const User = mongoose.model('User', UserSchema, 'AUTH_USER')


module.exports = {
  User, UserSchema, SimpleUserPopulatePath
}