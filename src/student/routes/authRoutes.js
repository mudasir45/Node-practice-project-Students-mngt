const {Router} = require('express');
const { 
    CreateAdminUSer, 
    CreateUsers, 
    Login, 
    GetToken 
} = require('../controller/authController');
const { validateToken, Authorize } = require('../middleware/auth_middleware')
const pool = require('../../../db')

const router = Router();

router.post('/create_admin', CreateAdminUSer);
router.post('/create_user', validateToken, Authorize(['create_teacher']), CreateUsers);
router.post('/login', Login);
router.post('/token', GetToken);


module.exports = router;