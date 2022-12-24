import { Request, Response } from 'express';
import { comments, PrismaClient } from "@prisma/client";
import { stringData } from '../functions';
import { addLog } from '../logs/addLog';
import { CommentsRepository } from '../repositories/CommentsRepository';

const prisma: PrismaClient = new PrismaClient();
const commentsRepository = new CommentsRepository();

export class CommentsController {
    async store(req: Request, res: Response) {
        if (req.session.username != undefined) {
            if (req.body.commentary != "") {
                const date = new Date();
                const { commentary, id } = req.body;

                commentsRepository.store(String(req.session.username), String(commentary), stringData(date.getTime()), Number(id));
                addLog(
                    `user ${req.session.username} upload comment on item by id=${req.body.id}, date_creating=${date}`
                );
                req.session.messageAlert = 'comment created successfully'
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
        addLog(
            `user ${req.session.username} delete comment by id=${req.body.idComment}`
        );
        req.session.messageAlert = 'comment deleted successfully';
        res.redirect("/items/" + String([req.body.id]));
    };

    async show(req: Request, res: Response) {
        const { id, skip } = req.params;
        const data = await prisma.comments.findMany({
            take: 20,
            skip: Number(skip),
            where: {
                item_id: Number(id)
            }
        });
        res.header('Access-Control-Allow-Origin', '*');
        res.send(data);
    }
};