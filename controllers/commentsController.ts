import { Request, Response } from 'express';
import { stringData } from '../functions';
import { CommentsRepository } from '../repositories/CommentsRepository';

const commentsRepository = new CommentsRepository();

export class CommentsController {
    async store(req: Request, res: Response) {
        if (req.session.username != undefined) {
            if (req.body.commentary != "") {
                const date = new Date();
                const { commentary, id } = req.body;

                commentsRepository.store(String(req.session.username), String(commentary), stringData(date.getTime()), Number(id));
                commentsRepository.storeLog(req.session.username, id);

                req.session.messageAlert = 'comment created successfully'
            }
        }
        res.redirect("/items/" + String([req.body.id]));
    };

    async delete(req: Request, res: Response) {
        commentsRepository.delete(Number(req.body.idComment));
        commentsRepository.deleteLog(req.session.username, req.body.idComment);
        req.session.messageAlert = 'comment deleted successfully';
        res.redirect("/items/" + String([req.body.id]));
    };

    async show(req: Request, res: Response) {
        const { id, skip } = req.params;
        const data = await commentsRepository.show(Number(id), Number(skip));
        res.header('Access-Control-Allow-Origin', '*');
        res.send(data);
    }
};