const express = require('express');
const studentRoutes = require('./src/student/routes/routes');
const authRouters = require('./src/student/routes/authRoutes');
const app = express();
const port = 3000;

app.get('/', (req, res)=>{
    res.send("Hello World!");
})

app.use(express.json());

app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/auth", authRouters);

app.listen(port, ()=>{
    console.log("Server listen at: ", port);
})
