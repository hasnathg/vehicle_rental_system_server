import express, { Request, Response } from "express"
import initDB from "./config/db";
import config from "./config";

import { usersRoute } from "./modules/users/users.route";
import { vehiclesRoute } from "./modules/vehicles/vehicles.route";
import { bookingsRoute } from "./modules/bookings/bookings.route";
import { authRoute } from "./modules/auth/auth.route";

const app = express();
app.use(express.json());


app.get('/',(req : Request, res : Response)=>{
    res.status(200).json({
        message : "This is the root route",
        path : req.path
    })
});

app.use("/api/v1/auth", authRoute);


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


const startServer = async () => {
    try {
        await initDB();
        app.listen (config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (err){
        console.error("Failed to start server:", err);
    }
};

startServer();

