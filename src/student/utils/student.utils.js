require('dotenv').config();
const fs = require('fs');
const pool = require('../../../db');
const Cloudinary = require('cloudinary')
const queries = require('../quries/quries');
const path = require('path')
const { v2: cloudinary } = Cloudinary;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET, 
  });


const UploadOnCloudinary = async (LocalFilePath)=>{
    try{
        if (!LocalFilePath){
            return null;
        }
        const response = await cloudinary.uploader.upload(LocalFilePath, {
            resource_type: "auto"
        })
        console.log("File uplaoded successfull!, ", (await response).url);
        // fs.unlinkSync(LocalFilePath);
        return response
    }
    catch (error){
        
        fs.unlinkSync(LocalFilePath);
        console.log("at uploadOnCloudinary error")
        return null;
    }
}


const CreateStudentObj = async (name, email, age, file, userId, department_id, createdBy)=> {
    try{
        const {originalname, filename } = file;
        const filePath = path.join(__dirname, '../../../uploads', filename); 
        const response = await UploadOnCloudinary(filePath);
        // console.log(response.url)
        const newStudent = await pool.query(queries.InsertStudent, [name, email, age, response.url, userId, department_id, createdBy]);
        return {student:newStudent.rows};

    } catch (error){
        console.error("Error creating student utils:", error);
        return null;

    }
}


const UpdateFile = async(id, name, email, age, file)=> {
    try{
        const {originalname, filename } = file;
        const filePath = path.join(__dirname, '../../../uploads', filename); 
        const response = await UploadOnCloudinary(filePath);
        console.log(response.url)
        const newStudent = await pool.query('INSERT INTO student (name, email, age, profile_img) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, age, response.url]);
        return {url, response, student:newStudent.rows};
    } catch (error){
        console.log(error)
        return null;

    }
}

const UploadStudentDoc = async(studentId, title, file)=> {
    try{
        const {originalname, filename } = file;
        const filePath = path.join(__dirname, '../../../uploads', filename); 
        const response = await UploadOnCloudinary(filePath);
        console.log(response.url)
        const newDoc = await pool.query('INSERT INTO student_doc (student_id, doc_title, doc_file) VALUES ($1, $2, $3) RETURNING *', [studentId, title, response.url]);
        return {url:response.url, newDoc:newDoc.rows};
    } catch (error){
        console.log(error)
        return null;

    }
}

const GetStudentsPage = async (offset, pageSize) => {
    const countResult = await pool.query(queries.GetStudentsCount);
    const totalStudents = parseInt(countResult.rows[0].count); 

    const studentsResult = await pool.query(queries.GetStudentsPage, [offset, pageSize]);
    const students = studentsResult.rows;

    return { totalStudents, students };
}

const CheckEmailExists = async(email)=> {
    const { rows } = await pool.query(queries.GetStudentByEmail, [email]);
    return rows.length > 0;
}


module.exports = {
    UploadOnCloudinary,
    CreateStudentObj,
    UpdateFile,
    UploadStudentDoc,
    GetStudentsPage,
    CheckEmailExists,
}