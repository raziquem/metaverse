import { Router } from "express";
import { CreateAvatarSchema, UpdateMetadataSchema } from "../../types/index.js";
import client from "@metaverse/db/client";
import { userMiddleware } from "../../middleware/user.js";
 
export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }
    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        res.json({message: "Metadata updated"})
        
    } catch (error) {
        console.log(error)
        res.status(400).json({message: "Internal server error"})
    }
})

userRouter.get("/metadata/bulk", async (req, res) => {
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = (userIdString).slice(1, userIdString?.length - 2).split(",");
    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        }, select: {
            avatar: true,
            id: true
        }
    })
    res.json({
        avatars: metadata.map(m => ({
            userId: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })
})
