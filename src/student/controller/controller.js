const pool = require('../../../db')
const queries = require('../quries/quries');
const path = require('path')
const utils = require('../utils/student.utils')

const GetStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const pageSize = parseInt(req.query.limit) || 0;

        if (pageSize <= 0) {
            const allStudents = await pool.query(queries.GetAllStudents);
            return res.status(200).json(allStudents);
        }

        const offset = (page - 1) * pageSize;
        const { totalStudents, students } = await utils.GetStudentsPage(offset, pageSize);

        const totalPages = Math.ceil(totalStudents / pageSize); 
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1; 

        return res.status(200).json({
            students,
            pagination: {
                totalStudents,
                totalPages,
                currentPage: page,
                hasNextPage,
                hasPreviousPage
            }
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

const GetStudentWithId = (req, res) => {
    const id = parseInt(req.params.id);
    const user = req.user;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid or missing student ID in request parameters" });
    }

    if (user.object.role == "student"){
        return res.status(403).json({"role":"Student", "message":"You do not have permissions get student by ID"})
    }

    pool.query(queries.GetStudentById, [id], (error, results) => {
        if (error) {
            console.error('Error fetching student by ID:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found with the provided ID' });
        }

        return res.status(200).json(results.rows);
    });
}


const CreateStudent = async (req, res) => {
    const { name, email, age, department_id } = req.body;
    const file = req.file;
    const user = req.user;
    const userId = user.object.id;

    if (!name || !email || !age || !file || !department_id) {
        return res.status(400).json({ message: "One or more fields are missing!", required_fields: ["name", "email", "age", "profile_img", "department_id"] });
    }

    if (user.object.role === "student"){
        const obj = await pool.query("SELECT * FROM student WHERE created_by=$1", [userId]);
        if (obj.rows.length){
            return res.send("Your are not be able to create more than one student objects as your role is student!");
        }

        const response = await utils.CreateStudentObj(name, email, age, file, userId, department_id, createdBy=userId);
        if (response===null){
            return res.status(500).send('Internal Server Error');
        }
        return res.status(201).json({ message: "Student created successfully!", response });
    }

    
    try {
        const emailExists = await utils.CheckEmailExists(email);
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const response = await utils.CreateStudentObj(name, email, age, file, userId, department_id, createdBy=userId);
        if (response===null){
            return res.status(500).send('Internal Server Error');
        }
        return res.status(201).json({ message: "Student created successfully!", response });

    } catch (error) {
        console.error("Error creating student:", error);
        return res.status(500).send('Internal Server Error');
    }
};

const updateStudent = async (req, res)=>{
    const {name, email, age} = req.body;
    const id = parseInt(req.params.id);
    
    if(!name || !email || !age || !req.file || !id){
        return res.status(500).json({message:"One or more fields are missing!", required_fields:"name, email, age, profile_img"})
    }

    pool.query(queries.getStudentByID, [id], (error, results)=>{
        if(error){
            console.log(error)
            return res.sendStatus("Error while getting student by id");
        } 
        if(!results.rows.length){
            res.status(404).send("Student not found!")
        }
    })

    const newStudent = await utils.UpdateFile(name, email, age, req.file, flag="update", id);
    return res.json({Message:"Student Created Successfully!", newStudent});
    
    pool.query(queries.updateStudentDetails, [name, email, age, id], (error, results)=>{
        if (error) throw error;

        res.json({"Message":"Student Updated Successfully!"});
    })
};

const deleteStudent = (req, res)=>{
    const id = parseInt(req.params.id);
    pool.query(queries.getStudentByID, [id], (error, results)=>{
        if(!results.rows.length){
            res.status(404).send("Student not found!")
        }
    })
    
    pool.query(queries.deleteStudentDetails, [id], (error, results)=>{
        if (error) throw error;

        res.json({"Message":"Student Deleted Successfully!"});
    })
};

const UploadDocs = async (req, res)=>{
    const {student_id, title} = req.body;
    if (!student_id || !title || !req.file){
        return res.status(500).json({"message":"One or more fields are missing!", required_fields:"student_id, title, doc_file"})
    }
    try {
        const newDoc = await utils.UploadStudentDoc(student_id, title, req.file);
        return res.json({Message:"Document Uploaded Sucessfully!", newDoc});


    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }

}

module.exports = {
    GetStudents,
    GetStudentWithId,
    CreateStudent,
    updateStudent,
    deleteStudent,
    UploadDocs,
}