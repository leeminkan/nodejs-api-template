const mongoose = require('mongoose');
const { User } = require('../AUTH/User');
const { subscribeDeviceToTopic } = require('../../services/firebaseAdmin');

const DeviceSchema = new mongoose.Schema({
  fcmToken: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topics: [{ type: String }],
  timeNow: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  isLogOut: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false }
},
  { toJSON: { virtuals: true } }
);

DeviceSchema.post('save', async (device) => {
  try {
    if (Array.isArray(device.topics) && device.topics.length > 0) {
      device.topics.forEach(async topic => {
        await subscribeDeviceToTopic(device.fcmToken, topic);
      });
    }

    const user = await User.findById(device.userId);
    if (user) {
      if (Array.isArray(user.devices)) {
        const index = user.devices.findIndex(item => {
          return item.toString() === device._id.toString();
        });
        if (device.isLogOut === false) {
          if (index < 0) {
            // add to array devices
            user.devices = [...user.devices, device._id];
            await user.save();
          }
        } else {
          if (index >= 0) {
            // remove from array devices
            let filterDevices = user.devices.filter(item => {
              return item.toString() !== device._id.toString();
            });
            user.devices = filterDevices;
            await user.save();
          }
        }
      } else {
        // add to array devices
        user.devices = [device._id];
        await user.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
});

const Device = mongoose.model('Device', DeviceSchema, 'DATA_DEVICE')


module.exports = {
  Device, DeviceSchema
}