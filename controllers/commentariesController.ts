import { Request, Response } from 'express';
import { comments, PrismaClient } from "@prisma/client";
import { Logger } from "../logs/logger";
import { stringData } from '../functions';

const prisma: PrismaClient = new PrismaClient();
const logger = new Logger();

export class CommentariesController {
    async add(req: Request, res: Response) {
        if (req.session.username != undefined) {
            if (req.body.commentary != "") {
                const data = String(new Date().getTime());
                await prisma.comments.create({
                    data: {
                        author: String(req.session.username),
                        commentary: String(req.body.commentary),
                        date_creating: stringData(data),
                        item_id: Number(req.body.id)
                    }
                })
                logger.addLog(
                    `user ${req.session.username} upload comment on item by id=${req.body.id}, date_creating=${data}`
                )
            }
        }
        res.redirect("/items/" + String([req.body.id]));
    };

    async delete(req: Request, res: Response) {
        await prisma.comments.delete({
            where: {
                id: Number(req.body.idComment)
            }
        })
        logger.addLog(
            `user ${req.session.username} delete comment by id=${req.body.idComment}`
        )
        res.redirect("/items/" + String([req.body.id]));
    };

    async show(req: Request, res: Response){
        const { id, skip } = req.params;
        const data = await prisma.comments.findMany({
            take: 20,
            skip: Number(skip),
            where: {
                id: Number(id)
            }
        });

        console.log(data);
        res.header('Access-Control-Allow-Origin', '*');
        res.send(data);
    }
};