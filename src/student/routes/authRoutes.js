const {Router} = require('express');
const controller = require('../controller/authController');
const middleware = require('../middleware/auth_middleware')
const pool = require('../../../db')

const router = Router();

router.post('/create_admin', controller.CreateAdminUSer);
router.post('/create_user', middleware.validateToken, controller.CreateUsers);
router.post('/login', controller.Login);
router.post('/token', controller.GetToken);


module.exports = router;