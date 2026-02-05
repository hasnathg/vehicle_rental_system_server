import express, { Request, Response } from "express"
import {Pool} from "pg"
import { usersRoute } from "./modules/users/users.route";
import initDB, { pool } from "./config/db";
import config from "./config";
import { vehiclesRoute } from "./modules/vehicles/vehicles.route";
import { bookingsRoute } from "./modules/bookings/bookings.route";

const app = express();
app.use(express.json());
const port = config.port;


initDB();

app.get('/',(req : Request, res : Response)=>{
    res.status(200).json({
        message : "This is the root route",
        path : req.path
    })

})

app.use('/api/v1/users', usersRoute );

app.use('/api/v1/vehicles', vehiclesRoute);

app.use('/api/v1/bookings', bookingsRoute );


app.use((req, res)=> {
    res.status(404).json({
        success: false,
        message: " Route not found",
        path: req.path,
    });
});



app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})