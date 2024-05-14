require('dotenv').config();
const jwt = require('jsonwebtoken');

const rolePermissions = {
    admin: ['create_hod', 'create_student', 'update_student', 'delete_student', 'view_student', 'create_teacher', 'update_teacher', 'delete_teacher', 'view_teachers', 'create_department', 'delete_department', 'update_department', 'upload_docs'],
    hod: ['create_teacher', 'create_student', 'update_student', 'delete_student', 'view_student', 'update_teacher', 'delete_teacher', 'view_teachers', 'add_department'],
    teacher: ['create_student', 'update_student', 'delete_student', 'view_student'],
    student: ['view_student', 'create_student', 'upload_docs'],
};


const validateToken = (req, res, next)=>{
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if (err) return res.sendStatus(403);
        req.user = user;
        req.user_role = user.object.role
        // console.log(req.user_role)
        next();
    })
}

const Authorize = (requiredPermissions) => {
    return (req, res, next) => {
        const userPermissions = rolePermissions[req.user_role];
        console.log('User Permissions:', userPermissions);
        console.log('Required Permissions:', requiredPermissions);
        
        if (!userPermissions || !requiredPermissions.every(permission => userPermissions.includes(permission))) {
            console.log('Unauthorized: Insufficient permissions');
            return res.status(403).json({ error: 'Unauthorized: Insufficient permissions' });
        }
        console.log('Authorized');
        next();
    };
};




module.exports = {
    validateToken,
    Authorize,
}
