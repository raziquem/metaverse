import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.js";
import { CreateAvatarSchema, CreateElementSchema, UpdateElementSchema } from "../../types/index.js";
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

adminRouter.put("/element/:elementId", async (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body)

    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    await client.element.update({
        where: {
            id: req.params.elementId
        }, data: {
            imageUrl: parsedData.data.imageUrl
        }
    })

    res.json({message: "Element updated"})
})

adminRouter.post("/avatar", async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body)

    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    const avatar = await client.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl
        }
    })

    res.json({id: avatar.id})
})

adminRouter.post("/map", (req, res) => {
    
})
