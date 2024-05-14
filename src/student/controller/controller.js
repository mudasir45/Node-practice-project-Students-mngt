const pool = require('../../../db')
const queries = require('../quries/quries');
const path = require('path')
const utils = require('../utils/student.utils');
const { response } = require('express');

const GetStudents = async (req, res) => {

    const user = req.user;
    if (user.object.role == "student"){


        const obj = await pool.query("SELECT * FROM student s WHERE s.user_id=$1;", [user.object.id]);

        return res.status(403).json({student:obj.rows, id:user.object.id})
    }

    try {
        const page = parseInt(req.query.page) || 1; 
        const pageSize = parseInt(req.query.limit) || 0;

        if (pageSize <= 0) {
            const allStudents = await pool.query(queries.GetAllStudents);
            return res.status(200).json(allStudents.rows);
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

    if (user.object.role === "student"){
     
        return res.status(403).json({ message: "You have not premisstions to create student object"});
    }

    if (!name || !email || !age || !file || !department_id) {
        return res.status(400).json({ message: "One or more fields are missing!", required_fields: ["name", "email", "age", "profile_img", "department_id"] });
    }

    if (!utils.ValidateEmail(email)){
        return res.status(500).json("Invalid Email Address!");
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

const UpdateStudent = async (req, res)=>{
    const { name, email, age, department_id } = req.body;
    const file = req.file;
    const user = req.user;
    const userId = user.object.id;
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid or missing student ID in request parameters" });
    }

    if (!name || !email || !age || !file || !department_id) {
        return res.status(400).json({ message: "One or more fields are missing!", required_fields: ["name", "email", "age", "profile_img", "department_id"] });
    }

    if (user.object.role == "student"){
        const obj = await pool.query("SELECT * FROM student WHERE user_id=$1 AND id=$2", [userId, id]);
        if (!obj.rows.length){
            return res.status(403).send("Student not found! Please enter your currect ID");
        }
    }

    pool.query(queries.GetStudentById, [id], (error, results)=>{
        if(error){
            console.log("Error in update student fetching by id", error)
            return res.status(500).sendStatus("Internal Server Error!");
        } 
        if(!results.rows.length){
            return res.status(404).send("Student not found!")
        }
    })

    const response = await utils.UpdateStudentObj(std_id=id, name, email, age, file, userId, department_id, createdBy=userId);
    if (response===null){
        return res.status(500).send('Internal Server Error');
    }
    return res.status(200).json({ message: "Student updated successfully!", response });
    
};

const DeleteStudent = async (req, res) => {
    const id = parseInt(req.params.id);
    const user = req.user;

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: "Invalid or missing student ID in request parameters" });
        }

        if (user.object.role !== "hod") {
            return res.status(403).send("You do not have permissions to perform this task!");
        }

        const student = await pool.query(queries.GetStudentById, [id]);
        if (student.rows.length === 0) {
            return res.status(404).send("Student not found!");
        }

        const response = await utils.DeleteStudentObj(id);
        if (!response) {
            return res.status(500).send('Internal Server Error');
        }

        return res.status(200).json({ message: "Student deleted successfully!" });
    } catch (error) {
        console.error("Error deleting student:", error);
        return res.status(500).send('Internal Server Error');
    }
};


const UploadDocs = async (req, res)=>{
    const {student_id, title} = req.body;
    const user = req.user;
    const userId = user.object.id;
    const file = req.file
    if (!student_id || !title || !file){
        return res.status(500).json({"message":"One or more fields are missing!", required_fields:["student_id", "title", "doc_file"]})
    }

    if (user.object.role != "student"){
        return res.status(403).send("Only students can upload their docs for now!")
    }

    if (user.object.role == "student"){
        const obj = await pool.query("SELECT * FROM student WHERE user_id=$1 AND id=$2", [userId, student_id]);
        if (!obj.rows.length){
            return res.status(403).send("Student not found! Please enter your currect student ID");
        }
    }

    try {
        const response = await utils.UploadStudentDoc(student_id, title, file);
        if (response===null){
            return res.status(500).send('Internal Server Error');
        }
        return res.status(200).json({ message: "Ducument uploaded successfully!", response });

    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }

}

module.exports = {
    GetStudents,
    GetStudentWithId,
    CreateStudent,
    UpdateStudent,
    DeleteStudent,
    UploadDocs,
}