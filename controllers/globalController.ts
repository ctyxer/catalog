import { Request, Response } from 'express';
import { renderObject } from '../functions';


export class GlobalController {
    async index(req: Request, res: Response) {
        res.render('home', renderObject(req));
    };

    async find(req: Request, res: Response) {
        res.render("findItems",
            renderObject(req)
        );
    };
}