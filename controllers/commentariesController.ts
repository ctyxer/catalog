import { Request, Response } from 'express';
import { comments, PrismaClient } from "@prisma/client";
import { Logger } from "../logs/logger";

const prisma: PrismaClient = new PrismaClient();
const logger = new Logger();

export class CommentariesController {
    async add(req: Request, res: Response) {
        logger.catcherErr(async () => {
            if (req.body.commentary != "") {
                await prisma.comments.create({
                    data: {
                        author: String(req.session.username),
                        commentary: String(req.body.commentary),
                        date_creating: String(new Date()),
                        item_id: Number(req.body.id)
                    }
                })
            }
            res.redirect("/items/" + String([req.body.id]));
        });
    };

    async delete(req: Request, res: Response) {
        logger.catcherErr(async() => {
            console.log(Number(req.body.id))
            await prisma.comments.delete({
                where: {
                    id: Number(req.body.idComment)
                }
            })
            res.redirect("/items/" + String([req.body.id]));
        });
    };
}