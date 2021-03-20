const express = require('express');
const chatMessageController = require('./chatMessage');
const { authenticate, authorize } = require('../../../../middlewares/auth');
const router = express.Router();
const { validate } = require("../../../../utils/validate");
const schema = require("../../../../validations/DATA/chatMessage/schema");

// ! unuse
//create
router.post(
  '/',
  authenticate,
  chatMessageController.createData
)
// ! unuse
//find all
router.get(
  '/',
  authenticate,
  chatMessageController.getData
)

// get latest messages
router.get(
  '/get-latest-messages',
  authenticate,
  validate(schema.getLatestMessagesSchema),
  chatMessageController.getLatestMessages
)

router.get(
  '/get-for-group',
  authenticate,
  validate(schema.getForGroupSchema),
  chatMessageController.getForGroup
)
// ! unuse
//find one item by id
router.get(
  '/:id',
  authenticate,
  chatMessageController.getDataById
)
// ! unuse
//update
router.put(
  '/:id',
  authenticate,
  chatMessageController.updateDataById
)
// ! unuse
// //actived
router.post(
  '/actived',
  authenticate,
  chatMessageController.activedMany
)
// ! unuse
router.put(
  '/:id/actived',
  authenticate,
  chatMessageController.activedDataById
)
// ! unuse
//delete
router.delete(
  '/:id',
  authenticate,
  authorize("unit", "delete"),
  chatMessageController.deleteDataById
)
// ! unuse
router.delete(
  '/',
  authenticate,
  chatMessageController.deleteMany
)

module.exports = router;