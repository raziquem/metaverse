import { Router } from "express";
import { UpdateMetadataSchema } from "../../types/index.js";
import client from "@metaverse/db/client";
import { userMiddleware } from "../../middleware/user.js";
 
export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({message: "Validation failed"})
    }
    await client.user.update({
        where: {
            id: req.userId
        },
        data: {
            avatarId: parsedData.data.avatarId
        }
    })
    res.json({message: "Metadata updated"})
})

userRouter.get("/api/v1/user/metadata/bulk", (req, res) => {

})
