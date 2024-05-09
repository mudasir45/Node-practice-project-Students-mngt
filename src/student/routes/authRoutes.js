const {Router} = require('express');
const controller = require('../controller/authController');
const pool = require('../../../db')

const router = Router();

router.post('/signUp', controller.SignUp);
router.post('/login', controller.Login);
router.post('/token', controller.GetToken);


module.exports = router;