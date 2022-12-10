import { Request, Response } from 'express';
import { renderObject } from '../functions';
import { Logger } from '../logs/logger';

const logger = new Logger();

export class GlobalController {
    async show(req: Request, res: Response) {
        logger.catcherErr(async () => {
            res.render('home', renderObject(req));
        });
    }
}