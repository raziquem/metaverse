import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.js";
import { CreateElementSchema } from "../../types/index.js";
import client from "@metaverse/db/client";

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body) 

    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    const element = await client.element.create({
        data: {
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static,
            imageUrl: parsedData.data.imageUrl
        }
    })

    res.json({id: element.id})
})

adminRouter.put("/element/:elementId", (req, res) => {

})

adminRouter.post("/avatar", (req, res) => {

})

adminRouter.post("/map", (req, res) => {
    
})
