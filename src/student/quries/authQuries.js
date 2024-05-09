const CheckUsernameExists = "SELECT * FROM auth s WHERE s.username = $1";
const CreateUser = "INSERT INTO auth (username, hashed_password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at;";


module.exports = {
    CheckUsernameExists,
    CreateUser,
}