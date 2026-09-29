import { Router } from "express";
import { userRouter } from  "./user.js";
import { spaceRouter } from "./space.js";
import { adminRouter } from "./admin.js";
import { SignupSchema } from "../../types/index.js";
import client from "@metaverse/db/client";
 
export const router = Router();

router.post("/signup", async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    try {
       const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: parsedData.data.password,
                role: parsedData.data.type === "admin" ? "Admin" : "User"
            }
        })
        res.json({
            userId: user.id
        })
    } catch (error) {
        res.status(400).json({message: "User already exists"})      
    }
})

router.post("/signin", (req, res) => {
    res.json({
        message: "signin"
    })
})

router.get("/elements", (req, res) => {
    
})

router.get("/avatars", (req, res) => {
    
})

router.use("/user", userRouter)

router.use("/space", spaceRouter)

router.use("/admin", adminRouter)