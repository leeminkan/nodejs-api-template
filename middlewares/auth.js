const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const keys = require('../config/index');
const verifyJwt = promisify(jwt.verify);
const { AccessToken } = require('../models/AUTH/AccessToken');
const { UserPermission } = require('../models/AUTH/UserPermission');
const moment = require('moment');

module.exports.authenticate = (req, res, next) => {
  const token = req.header("token");
  verifyJwt(token, keys.SECRET_KEY)
    .then(async (decoded) => {
      const date_now = moment().format('X');
      const access_token = await AccessToken.findOne({ token: token, exp: { $gte: date_now } });
      if (access_token === null) {
        res.status(401).json({ message: "Token hết hạn, vui lòng đăng nhập lại" })
      } else if (decoded) {
        req.user = decoded;
        return next();
      }
    })
    .catch(() => res.status(401).json({ message: "Chưa đăng nhập" }))
}

module.exports.authorize = (modules, action) => {
  return async (req, res, next) => {
    const { user } = req;
    if (user.userType === 'root') return next();
    else {
      const user_permission = await UserPermission.findOne({ userId: user.userId, modules: modules, actions: action });
      if (user_permission != null) {
        return next();
      } else {
        return res.status(403).json({
          message: "Bạn không có quyền"
        })
      }
    }
  }
}