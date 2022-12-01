import { Request, Response } from 'express';
import { comments, PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export class CommentariesController { 
    async add (req: Request, res: Response) {
        if (req.body.commentary != "") {
            await prisma.comments.create({
                data: {
                    author: String(req.session.username),
                    commentary: req.body.commentary,
                    date_creating: String(new Date()),
                    item_id: req.body.id
                }
            })
        }
        res.redirect("/items/" + String([req.body.id]));
    };

    async delete (req: Request, res: Response) {
        await prisma.comments.delete({
            where: {
                id: Number(req.body.id)
            }
        })
        res.redirect("/items/" + String([req.body.id]));
    };
 }