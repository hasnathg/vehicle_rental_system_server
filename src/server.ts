import express, { Request, Response } from "express"
import {Pool} from "pg"
import { usersRoute } from "./modules/users/users.route";
import { initDB, pool } from "./config/db";
import dotenv from 'dotenv';
import path from "path"

dotenv.config({path: path.join(process.cwd(), '.env')});

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;


initDB()



app.get('/',(req : Request, res : Response)=>{
    res.status(200).json({
        message : "This is the root route",
        path : req.path
    })

})

app.use('/api/v1/users', usersRoute );

app.get('/api/v1/users', async (req: Request, res: Response) => {
    try{
        const result = await pool.query(`SELECT * FROM users`);
        res.status(200).json({
            success: true,
            message: "user retrieved succefully",
            data: result.rows,
        });

    } catch (err: any){
        res.status(500).json({
            sussess: false,
            message: err.message,
            details: err,
        });
    }
});

app.get('/api/v1/users/:id', async(req: Request, res: Response) => {
    try{
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id,
        ]);

        if(result.rows.length === 0){
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else{
            res.status(200).json({
                status: true,
                message: "User fetched succesfully",
                data: result.rows[0],
            });
        }

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

app.put('/api/v1/users/:id', async(req: Request, res: Response) => {
    const {name, email, password, phone, role} = req.body;
    try{
        const result = await pool.query(`UPDATE users SET name=$1, email=$2, password=$3, phone=$4, role=$5 WHERE id=$6 RETURNING *`, [name, email, password, phone, role, req.params.id
        ]);

        if(result.rows.length === 0){
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else{
            res.status(200).json({
                status: true,
                message: "User updated succesfully",
                data: result.rows[0],
            });
        }

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

app.delete('/api/v1/users/:id', async(req: Request, res: Response) => {
    try{
        const result = await pool.query(`DELETE FROM users WHERE id=$1`, [req.params.id,
        ]);

        if(result.rowCount === 0){
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else{
            res.status(200).json({
                status: true,
                message: "User deleted succesfully",
                data: null,
            });
        }

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

app.post('/api/v1/vehicles', async(req: Request, res: Response ) => {
    const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = req.body;
    try{
      const result = await pool.query(`INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1,$2,$3,$4,$5) RETURNING *`, [vehicle_name, type, registration_number, daily_rent_price, availability_status])
      res.status(201).json({
        success: true,
        message: "Vehicles created",
        data: result.rows[0]
      })
    } catch(err: any){
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

app.get('/api/v1/vehicles', async (req: Request, res: Response) => {
    try{
        const result = await pool.query(`SELECT * FROM vehicles`);
        res.status(200).json({
            success: true,
            message: "Vehicles retrieved succefully",
            data: result.rows,
        });

    } catch (err: any){
        res.status(500).json({
            sussess: false,
            message: err.message,
            details: err,
        });
    }
});

app.get('/api/v1/vehicles/:id', async(req: Request, res: Response) => {
    try{
        const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [req.params.id,
        ]);

        if(result.rows.length === 0){
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        } else{
            res.status(200).json({
                status: true,
                message: "Vehicle fetched succesfully",
                data: result.rows[0],
            });
        }

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

app.put('/api/v1/vehicles/:id', async(req: Request, res: Response) => {
    const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = req.body;
    try{
        const result = await pool.query(`UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING *`, [vehicle_name, type, registration_number, daily_rent_price, availability_status, req.params.id
        ]);

        if(result.rows.length === 0){
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        } else{
            res.status(200).json({
                status: true,
                message: "Vehicle updated succesfully",
                data: result.rows[0],
            });
        }

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

app.delete('/api/v1/vehicles/:id', async(req: Request, res: Response) => {
    try{
        const result = await pool.query(`DELETE FROM vehicles WHERE id=$1`, [req.params.id,
        ]);

        if(result.rowCount === 0){
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        } else{
            res.status(200).json({
                status: true,
                message: "Vehicle deleted succesfully",
                data: null,
            });
        }

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

app.post('/api/v1/bookings',async(req: Request, res: Response)=>{
    const {customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status} = req.body;
    try{
       const result = await pool.query(`INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status])
       res.status(201).json({
        success: true,
        message: "Bookings created",
        data: result.rows[0]
       })
    } catch(err: any){
        res.status(500).json({
            success: false,
            message: err.message,
        });

    }
});

app.get('/api/v1/bookings', async(req: Request, res: Response)=>{
    try{
       const result = await pool.query(`SELECT * FROM bookings`);
       res.status(200).json({
        success: true,
        message: "Bookings retrived succesfully",
        data: result.rows,
       });
    }catch(err: any){
        res.status(500).json({
            success: false,
            message: err.message,
            details: err,
        });

    }
});

app.get('/api/v1/bookings/:id', async(req: Request, res: Response) => {
    try{
      const result = await pool.query(`SELECT FROM vehicles WHERE id=$1`, [req.params.id,]);

      if(result.rows.length === 0){
        res.status(404).json({
            success: false,
            message: "Bookings not found",
        });
      } else {
        res.status(200).json({
            status: true,
            message: "Booking fetched successfully",
            data: result.rows[0],
        });
      }
    } catch (err: any){
        res.status(500).json({
            status: false,
            message: err.message,
        });

    }
});

app.put('/api/v1/bookings/:id',async(req: Request, res: Response) => {
    const {customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status} = req.body;
    try{
        const result = await pool.query(`UPDATE bookings SET customer_id=$1, vehicle_id=$2, rent_start_date=$3, rent_end_date=$4, total_price=$5, status=$6 WHERE id=$7 RETURNING *`, [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status, req.params.id]);

        if(result.rows.length ===0){
            res.status(404).json({
                success: false,
                message: "Bookings not found",
            });
        } else{
            res.status(200).json({
                success: true,
                message: "Bookings updated successfully",
                data: result.rows[0],
            });
        }

    } catch(err: any){
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
});

app.delete('/api/v1/bookings/:id', async(req: Request, res: Response) => {
    try{
       const result = await pool.query(`DELETE FROM bookings WHERE id=$1`, [req.params.id,]);

       if (result.rowCount === 0){
        res.status(404).json({
            success: false,
            message: "Bookings not found",
        });
       } else{
        res.status(200).json({
            status: true,
            message: "Booking deleted successfully",
            data: null,
        });
       }
    } catch (err: any){
        res.status(500).json({
            status: false,
            message: err.message,
        });

    }
});





app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})