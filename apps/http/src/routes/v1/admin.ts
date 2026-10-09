import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin.js";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types/index.js";
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
            imageUrl: parsedData.data.imageUrl,
            name: parsedData.data.name
        }
    })

    res.json({avatarId: avatar.id})
})

adminRouter.post("/map", async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body)

    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    const map = await client.map.create({
        data: {
            name: parsedData.data.name,
            thumbnail: parsedData.data.thumbnail,
            width: Number(parsedData.data.dimensions.split("x")[0]),
            height: Number(parsedData.data.dimensions.split("y")[1]),
            mapElements: {
                create: parsedData.data.defaultElements.map(e => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }
        }
    })

    res.json({id: map.id})
})
