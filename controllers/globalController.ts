import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { renderObject } from '../functions';

const prisma: PrismaClient = new PrismaClient();

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