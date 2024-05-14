const GetAllStudents = "SELECT * FROM student";
const GetStudentById = "SELECT * FROM student WHERE id = $1";
const GetStudentByEmail = "SELECT * FROM student s WHERE s.email = $1";
const updateStudentDetails = "UPDATE student SET name = $1, email = $2, age = $3 WHERE id = $4";
const DeleteStudent = "DELETE FROM student WHERE id = $1";
const GetStudentsCount = "SELECT COUNT(*) AS count FROM student;";
const GetStudentsPage = "SELECT * FROM student ORDER BY id OFFSET $1 LIMIT $2;";
const CreateStudentDoc = "INSERT INTO student_doc (student_id, doc_title, doc_file, file_type) VALUES ($1, $2, $3, $4) RETURNING *"

const InsertStudent = `
    INSERT INTO student (name, email, age, profile_img, user_id, department_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *
    `;
const UpdateStudent = `
    UPDATE student SET 
    name=$2,
    email=$3,
    age=$4,
    profile_img=$5,
    user_id=$6,
    department_id=$7,
    created_by=$8
    WHERE id=$1 
    RETURNING *
    `;


module.exports = {
    GetAllStudents,
    GetStudentById,
    GetStudentByEmail,
    InsertStudent,
    updateStudentDetails,
    DeleteStudent,
    GetStudentsCount,
    GetStudentsPage,
    UpdateStudent,
    CreateStudentDoc,
}