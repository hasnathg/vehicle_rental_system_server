import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userServices } from "./users.services";



const createUser = async(req : Request, res : Response)=>{
    try{
        const { name, email, password, phone, role} = req.body;
    const result = await userServices.createUser(name, email, password, phone, role);

    return res.status(201).json({
        success: true,
        message: "Data inserted succesfully",
        data: result.rows[0]
    });

    } catch (error: any){
    return res.status(500).json({
        success: true,
        message: error.message,
    });
}
};

const getUser = async (req: Request, res: Response) => {
    try{
        const result = await userServices.getUser();
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
};

const getSingleUser = async(req: Request, res: Response) => {
    try{
        const result = await userServices.getSingleUser(req.params.id as string);

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
};

const updateUser = async(req: Request, res: Response) => {
    const {name, email, password, phone, role} = req.body;
    try{
        const result = await userServices.updateUser(name, email, password, phone, role, req.params.id as string);

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
};

const deleteUser = async(req: Request, res: Response) => {
    try{
        const result = await userServices.deleteUser(req.params.id as string);

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
}

export const userControllers = {
    createUser,
    getUser,
    getSingleUser,
    updateUser,
    deleteUser,
};