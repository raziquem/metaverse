import { Router } from "express";
import { userRouter } from  "./user.js";
import { spaceRouter } from "./space.js";
import { adminRouter } from "./admin.js";
import { SignupSchema } from "../../types/index.js";
import { SigninSchema } from "../../types/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "@metaverse/db/client";
import { JWT_PASSWORD } from "../../config.js";
 
export const router = Router();

router.post("/signup", async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10)

    try {
       const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type === "admin" ? "Admin" : "User"
            }
        })
        res.json({
            userId: user.id
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({message: "User already exists"})      
    }
})

router.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(403).json({message: "Validation failed"})
    }

    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })
        if(!user){
            return res.status(403).json({message: "User not found"})
        }

        const isValid = await bcrypt.compare(parsedData.data.password, user.password)

        if(!isValid){
            return res.status(403).json({message: "Invalid password"})
        }
        
        const token = jwt.sign({
            user: user.id,
            role: user.role
        }, JWT_PASSWORD);

        res.json({
            token
        })
    } catch (error) {
        return res.status(400).json({message: "Internal server error"})
    }
})

router.get("/elements", (req, res) => {
    
})

router.get("/avatars", (req, res) => {
    
})

router.use("/user", userRouter)

router.use("/space", spaceRouter)

router.use("/admin", adminRouter)