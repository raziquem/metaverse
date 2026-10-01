import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config.js";
import type { NextFunction, Request, Response } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];

    if(!token) {
        return res.status(403).json({message: "Unauthorized"})
    }

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD) as { role: string, userId: string }
        if(decoded.role !== "Admin"){
            return res.status(403).json({message: "Unauthorized"})
        }
        req.userId = decoded.userId
        next()
    } catch(e){
            return res.status(401).json({message: "Unauthorized"})
    }
}