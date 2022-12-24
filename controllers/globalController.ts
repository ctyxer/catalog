import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { renderObject } from '../functions';
import { GlobalRepository } from '../repositories/GlobalRepository';

const prisma: PrismaClient = new PrismaClient();
const globalRepository = new GlobalRepository();

export class GlobalController {
    async index(req: Request, res: Response) {
        res.render('home', renderObject(req));
    };

    async find(req: Request, res: Response) {
        res.render("findItems",
            renderObject(req)
        );
    };

    async userPage(req: Request, res: Response) {
        const { username } = req.params;
        let user = await globalRepository.userPage(username);

        res.render('userpage', renderObject(req, { 'user': user }));
    }
}