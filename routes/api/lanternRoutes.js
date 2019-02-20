const router = require('express').Router();
const lanternController = require('../../controllers/lanternController');

router
  .route('/')
  .get(lanternController.findAll)
  .post(lanternController.create);

router
  .route('/user')
  .get(lanternController.findUser);

module.exports = router;
