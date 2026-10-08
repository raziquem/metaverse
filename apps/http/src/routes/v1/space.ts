import { Router, type Request } from "express";
import { userMiddleware } from "../../middleware/user.js";
import client from "@metaverse/db/client";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types/index.js";
import { parse } from "zod";


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

spaceRouter.delete("/:spaceId", userMiddleware, async (req: Request<{ spaceId: string }>, res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        }, select: {
            creatorID: true
        }
    })

    if(!space){
        return res.status(400).json({message: "Space not found"})
    }

    if(space.creatorID !== req.userId){
        return res.status(403).json({message: "Unauithorized"})
    }

    await client.space.delete({
        where: {
            id: req.params.spaceId
        }
    })

    res.json({message: "Space deleted"})
})

spaceRouter.get("/all", userMiddleware, async (req, res) => {
    const spaces = await client.space.findMany({
        where: {
            creatorID: req.userId!
        }
    });

    res.json({
        spaces: spaces.map(s => ({
            id: s.id,
            name: s.name,
            dimensions: `${s.width}x${s.height}`,
            thumbnail: s.thumbnail
        }))
    })
})

spaceRouter.get("/:spaceId", async (req, res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        }, include: {
            elements: {
                include: {
                    element: true
                }
            },

        }
    })

    if(!space) {
        return res.status(400).json({message: "Space not found"})
    }

    res.json({
        "dimensions": `${space.width}x${space.height}`,
        elements: space.elements.map(e => ({
            id: e.id,
            element: {
                id: e.element.id,
                imageUrl: e.element.imageUrl,
                width: e.element.width,
                height: e.element.height,
                static: e.element.static
            },
            x: e.x,
            y: e.y
        }))
    })
})

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }

    const space = await client.space.findUnique({
        where: {
            id: req.body.spaceId,
            creatorID: req.userId!
        }, select: {
            width: true,
            height: true
        }
    })

    if(!space){
        return res.status(400).json({message: "Space not found"})
    }

    await client.spaceElements.create({
        data: {
            spaceId: req.body.spaceId,
            elementId: req.body.spaceId,
            x: req.body.x,
            y: req.body.y
        }
    })

    res.json({message: "Element added"})
})

spaceRouter.delete("/elemet", userMiddleware, async (req, res) => {
    const parsedData = DeleteElementSchema.safeParse(req.body)

    if(!parsedData.success){
        return res.status(400).json({message: "Validatin failed"})
    }

   const spaceElements = await client.spaceElements.findFirst({
        where: {
            id: parsedData.data.id,
        }, include: {
            space: true
        }
    })

    if(!spaceElements?.space.creatorID || spaceElements.space.creatorID !== req.userId) {
        return res.status(403).json({message: "Unauthorized"})
    }

    await client.spaceElements.delete({
        where: {
            id: req.body.spaceId
        }
    })

    res.json({message: "Element deleted"})

})

