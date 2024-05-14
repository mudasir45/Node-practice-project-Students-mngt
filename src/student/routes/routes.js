const { Router } = require('express');
const {
    CreateStudent, 
    GetStudents,
    GetStudentWithId,
    UpdateStudent,
    UploadDocs, 
    DeleteStudent 
} = require('../controller/controller');
const authController = require('../controller/authController')
const { validateToken, Authorize} = require('../middleware/auth_middleware')
const { upload } = require('../middleware/student.middleware')
const router = Router();


router.get('/', validateToken, Authorize(['view_student']), GetStudents);
router.get('/:id', validateToken, Authorize(['delete_student']), GetStudentWithId);
router.post('/create_student', validateToken, Authorize(['create_student']), upload.single('profile_img'), CreateStudent);
router.put('/:id', validateToken, Authorize(['update_student']), upload.single('profile_img'), UpdateStudent);
router.delete('/:id', validateToken, Authorize(['delete_student']), DeleteStudent);
router.post('/upload_doc', validateToken, Authorize(['upload_docs']), upload.single('doc_file'), UploadDocs);

module.exports = router;