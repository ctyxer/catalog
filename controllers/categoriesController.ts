import { Request, Response } from 'express';
import { categories, users, items, PrismaClient } from "@prisma/client";
import { Logger } from "../logs/logger";
import { renderObject, stringData } from '../functions';

const prisma: PrismaClient = new PrismaClient();
const logger = new Logger();

export class CategoriesController {
    async show(req: Request, res: Response) {
        const categories = await prisma.categories.findMany();

        res.render('categories',
            renderObject(req, {
                'categories': categories
            }));
    };

    async addGet(req: Request, res: Response) {
        if (req.session.auth != true) {
            res.redirect("/");
        } else {
            res.render("addCategory",
                renderObject(req, { 'error': '' }));
        }
    };

    async addPost(req: Request, res: Response) {
        logger.catcherErr(async () => {
            const { name } = req.body;
            if (name == undefined) {
                logger.addLog(
                    `${req.session.username} cannot add category. error: the field cannot be empty`
                );
                res.render('addCategory',
                    renderObject(req, {
                        'error': "The field cannot be empty"
                    }));
            } else {
                const data = await prisma.categories.findFirst({
                    where: {
                        'name': name
                    }
                })
                if (data != null) {
                    logger.addLog(
                        `${req.session.username} cannot add category. error: name already taken`
                    );
                    res.render('addCategory',
                        renderObject(req, {
                            'error': "Name already taken"
                        }));
                } else {
                    logger.addLog(
                        `${req.session.username} add category name=${name}`
                    );
                    await prisma.categories.create({
                        data: {
                            'name': name
                        }
                    });
                    res.redirect('/categories');
                }
            }
        });
    };

    async item(req: Request, res: Response){
        let items = await prisma.items.findMany({
            where: {
                'category_id': Number(req.params.id)
            }
        });

        items = items.map(function (a: items) {
            return { ...a, date_creating: stringData(String(a.date_creating)) };
        })
        res.render('items', renderObject(req,{ 
            'items': items
        }))
    };
};