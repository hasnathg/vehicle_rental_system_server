import { Request, Response } from "express";
import bcrypt from "bcrypt"
import { userServices } from "./users.services";

const BCRYPT_SALT_ROUNDS = 10;


const createUser = async(req : Request, res : Response)=>{
    try{
        const { name, email, password, phone, role} = req.body;

        if (!name || !email || !password || !phone || !role) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: "name, email, password, phone, role are required",
        });
        }   

        const passwordHash = await bcrypt.hash(String(password), BCRYPT_SALT_ROUNDS);
 
    const result = await userServices.createUser(name, email, passwordHash, phone, role);

    return res.status(201).json({
        success: true,
        message: "Data inserted succesfully",
        data: result,
    });

    } catch (error: any){
    return res.status(500).json({
        success: true,
        message: "Internal server error",
        errors: error.message,
    });
}
};

const getUser = async (req: Request, res: Response) => {
    try{
        const result = await userServices.getUser();
        return res.status(200).json({
            success: true,
            message: result.length ? "user retrieved succefully" : "No users found",
            data: result,
        });

    } catch (err: any){
        return res.status(500).json({
            sussess: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};

const getSingleUser = async(req: Request, res: Response) => {
    try{
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId)) {
        return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "userId must be a number",
      });
    }

        const result = await userServices.getSingleUser(userId);

        if(!result){
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "User not found",
            });
        } 
            return res.status(200).json({
                success: true,
                message: "User fetched succesfully",
                data: result,
            });
        

    } catch (err: any) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};

const updateUser = async(req: Request, res: Response) => {
    try{
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId)){
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "userId must be a number",
            });
        }
        
        const { name, email, password, phone, role } = req.body;

        const payload: any = {};
        if (name !== undefined) payload.name = String(name);
        if (email !== undefined) payload.email = String(email);
        if (phone !== undefined) payload.phone = String(phone);
        if (role !== undefined) payload.role = String(role);

        if (password !== undefined && String(password).length > 0) {
        payload.passwordHash = await bcrypt.hash(String(password), BCRYPT_SALT_ROUNDS);
        }

        const result = await userServices.updateUser(userId, payload);

        if(!result){
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "User not found",
            });
        } 
        return res.status(200).json({
                success: true,
                message: "User updated succesfully",
                data: result,
            });
        

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server erroe",
            errors: err.message,
        });
    }
};

const deleteUser = async(req: Request, res: Response) => {
    try{
        const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "userId must be a number",
      });
    }
        const result = await userServices.deleteUser(userId);

        if(result === 0){
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "User not found",
            });
        } 
        return res.status(200).json({
                success: true,
                message: "User deleted succesfully",
                data: null,
            });
        

    } catch (err: any) {
        const msg = String(err.message || "");
        const isBadRequest = msg.includes("Cannot delete user with active bookings");

        return res.status(isBadRequest ? 400 :500).json({
            success: false,
            message: isBadRequest ? "Bad request" : "Internal server erroe",
            errors: err.message,
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