import { Router } from "express";
import { userMiddleware } from "../../middleware/user.js";
import client from "@metaverse/db/client";
import { CreateSpaceSchema } from "../../types/index.js";


export const spaceRouter = Router();


spaceRouter.post("/", userMiddleware, async (req, res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    if(!parsedData.data.mapId){
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: Number(parsedData.data.dimensions.split("x")[0]),
                height: Number(parsedData.data.dimensions.split("y")[1]),
                creatorID: req.userId!,
            }
        });
        res.json({spaceId: space.id})
    }
    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId
        }, select: {
            mapElements: true,
            width: true,
            height: true
        }
    })

    if(!map){
        return res.status(403).json({message: "Map not found"})
    }

    let space = await client.$transaction(async () => {
       const space = await client.space.create({
        data: {
            name: parsedData.data.name,
            width: map.width,
            height: map.height,
            creatorID: req.userId!,
        }
    });

    await client.spaceElements.createMany({
        data: map.mapElements.map(e => ({
            spaceId: space.id,
            elementId: e.elementId,
            x: e.x!,
            y: e.y!
        }))
    })
    return space;
    })
    res.json({spaceId: space.id})
})

spaceRouter.delete("/:spaceId", (req, res) => {

})

spaceRouter.get("/all", (req, res) => {

})

spaceRouter.get("/:spaceId", (req, res) => {

})

spaceRouter.post("/element", (req, res) => {

})

spaceRouter.delete("/elemet", (req, res) => {

})

