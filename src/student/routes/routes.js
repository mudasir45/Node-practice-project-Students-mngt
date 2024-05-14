const { Router } = require('express');
const controller = require('../controller/controller');
const authController = require('../controller/authController')
const authMiddleware = require('../middleware/auth_middleware')
const middleware = require('../middleware/student.middleware')
const router = Router();

router.get('/', authMiddleware.validateToken, controller.GetStudents);
router.get('/:id', controller.GetStudentWithId);
router.post('/create_student', authMiddleware.validateToken, middleware.upload.single('profile_img'), controller.CreateStudent);
router.put('/:id', authMiddleware.validateToken, middleware.upload.single('profile_img'), controller.UpdateStudent);
router.delete('/:id', authMiddleware.validateToken, controller.DeleteStudent);
router.post('/upload_doc', authMiddleware.validateToken, middleware.upload.single('doc_file'), controller.UploadDocs);

module.exports = router;