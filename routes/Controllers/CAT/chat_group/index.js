const express = require('express');
const chatGroupController = require('./chatGroup');
const { authenticate } = require('../../../../middlewares/auth');
const router = express.Router();
const { validate } = require("../../../../utils/validate");
const schema = require("../../../../validations/CAT/chatGroup/schema");

//for test
router.get(
  '/all',
  chatGroupController.deleteAll
)

router.get(
  '/redis-socket-info',
  chatGroupController.getRedisSocketInfo
)

//create
router.post(
  '/',
  authenticate,
  validate(schema.createSchema),
  chatGroupController.createData
)
// ! unuse
//find all
router.get(
  '/',
  authenticate,
  chatGroupController.getData
)

router.get(
  '/get-by-code',
  authenticate,
  validate(schema.getByCodeSchema),
  chatGroupController.getChatGroupByCode
)

router.get(
  '/get-by-receiver-id',
  authenticate,
  validate(schema.getByReceiverIdSchema),
  chatGroupController.getChatGroupByReceiverId
)
// ! unuse
//find one item by id
router.get(
  '/:id',
  authenticate,
  chatGroupController.getDataById
)

//update
router.put(
  '/:id',
  authenticate,
  validate(schema.updateSchema),
  chatGroupController.updateDataById
)

// add member
router.post(
  '/add-member',
  authenticate,
  validate(schema.addMemberSchema),
  chatGroupController.addMember
)

// remove member
router.post(
  '/remove-member',
  authenticate,
  validate(schema.removeMemberSchema),
  chatGroupController.removeMember
)

// leave group
router.post(
  '/leave-group',
  authenticate,
  validate(schema.leaveGroupSchema),
  chatGroupController.leaveGroup
)
// ! unuse
// //actived
router.post(
  '/actived',
  authenticate,
  chatGroupController.activedMany
)
// ! unuse
router.put(
  '/:id/actived',
  authenticate,
  chatGroupController.activedDataById
)
// * delete by id
router.delete(
  '/:id',
  authenticate,
  validate(schema.deleteByIdSchema),
  chatGroupController.deleteDataById
)
// ! unuse
router.delete(
  '/',
  authenticate,
  chatGroupController.deleteMany
)

module.exports = router;