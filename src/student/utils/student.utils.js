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
        fs.unlinkSync(LocalFilePath);
        return response
    }
    catch (error){
        
        fs.unlinkSync(LocalFilePath);
        console.log("at uploadOnCloudinary error")
        return null;
    }
}

const DeleteOnCloudinary = async (public_id, type)=>{
    try{
        if (!public_id){
            return null;
        }
        const response = await cloudinary.api.delete_resources([public_id], {
             type: 'upload', 
             resource_type: type 
            })
        console.log("File deleted successfully!, ", response);
        // fs.unlinkSync(LocalFilePath);
        return response
    }
    catch (error){
        console.log("at uploadOnCloudinary error")
        return null;
    }
}


const CreateStudentObj = async (name, email, age, file, userId, department_id, createdBy)=> {
    try{
        const {originalname, filename } = file;
        const filePath = path.join(__dirname, '../../../uploads', filename); 
        const response = await UploadOnCloudinary(filePath);
        const newStudent = await pool.query(queries.InsertStudent, [name, email, age, response.url, userId, department_id, createdBy]);
        return {response, student:newStudent.rows};

    } catch (error){
        console.error("Error creating student utils:", error);
        return null;

    }
}
const UpdateStudentObj = async (std_id, name, email, age, file, userId, department_id, createdBy)=> {
    try{
        const {originalname, filename } = file;
        const filePath = path.join(__dirname, '../../../uploads', filename); 
        const obj = await pool.query("SELECT s.profile_img FROM student s WHERE s.id=$1", [std_id]);
        const old_url = obj.rows[0].profile_img;
        const public_id = old_url.split(' ')[1]
        console.log(public_id)

        const deleteResponse = await DeleteOnCloudinary(public_id, 'image')

        const response = await UploadOnCloudinary(filePath);
        const url = `${response.url} ${response.public_id}`
        const newStudent = await pool.query(queries.UpdateStudent, [std_id,name, email, age, url, userId, department_id, createdBy]);
        return {deleteResponse, student:newStudent.rows};

    } catch (error){
        console.error("Error updating student utils:", error);
        return null;

    }
}

const DeleteStudentObj = async (std_id)=> {
    try{
        const obj = await pool.query("SELECT s.profile_img FROM student s WHERE s.id=$1", [std_id]);
        const old_url = obj.rows[0].profile_img;
        const public_id = old_url.split(' ')[1]
        await DeleteOnCloudinary(public_id, 'image')
        await pool.query(queries.DeleteStudent, [std_id]);
        return true;

    } catch (error){
        console.error("Error updating student utils:", error);
        return null;

    }
}


const UploadStudentDoc = async(studentId, title, file)=> {
    try{
        const { filename } = file;
        const filePath = path.join(__dirname, '../../../uploads', filename); 
        const response = await UploadOnCloudinary(filePath);
        const url = `${response.url} ${response.public_id}`
        const newDoc = await pool.query(queries.CreateStudentDoc, [studentId, title, url, response.resource_type]);
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


const ValidateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

module.exports = {
    UploadOnCloudinary,
    CreateStudentObj,
    UpdateStudentObj,
    UploadStudentDoc,
    GetStudentsPage,
    CheckEmailExists,
    DeleteStudentObj,
    ValidateEmail,
}