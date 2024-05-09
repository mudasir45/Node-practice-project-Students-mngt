const GetAllStudents = "SELECT * FROM student";
const GetStudentById = "SELECT * FROM student WHERE id = $1";
const GetStudentByEmail = "SELECT * FROM student s WHERE s.email = $1";
const updateStudentDetails = "UPDATE student SET name = $1, email = $2, age = $3 WHERE id = $4";
const deleteStudentDetails = "DELETE FROM student WHERE id = $1";
const GetStudentsCount = "SELECT COUNT(*) AS count FROM student;";
const GetStudentsPage = "SELECT * FROM student ORDER BY id OFFSET $1 LIMIT $2;";
const InsertStudent = `
    INSERT INTO student (name, email, age, profile_img, user_id, department_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *
    `;


module.exports = {
    GetAllStudents,
    GetStudentById,
    GetStudentByEmail,
    InsertStudent,
    updateStudentDetails,
    deleteStudentDetails,
    GetStudentsCount,
    GetStudentsPage,
}