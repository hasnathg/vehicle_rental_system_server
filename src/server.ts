import express, { Request, Response } from "express"
import {Pool} from "pg"
import { usersRoute } from "./modules/users/users.route";
import { initDB } from "./config/db";

const app = express();
app.use(express.json());
const port = 5000;


initDB()

app.use('/api/v1/users', usersRoute );

app.get('/',(req : Request, res : Response)=>{
    res.status(200).json({
        message : "This is the root route",
        path : req.path
    })

})

app.listen(5000, ()=>{
    console.log("Server is running on port ${port}");
})