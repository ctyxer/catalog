import { Request, Response } from 'express';
import { categories, users, items, PrismaClient } from "@prisma/client";
import { renderObject } from '../functions';
import { addLog } from '../logs/addLog';

const prisma: PrismaClient = new PrismaClient();

export class CategoriesController {
    async index(req: Request, res: Response) {
        const categories = await prisma.categories.findMany();

        res.render('categories',
            renderObject(req, {
                'categories': categories
            })
        );
    };

    async show(req: Request, res: Response) {
        let data = await prisma.items.findMany({
            'include': {
                category: true
            }
        });
        res.render("items",
            renderObject(req, { 'items': data })
        );
    };

    async create(req: Request, res: Response) {
        if (req.session.auth != true) {
            res.redirect("/");
        } else {
            res.render("addCategory",
                renderObject(req, { 'error': '' })
            );
        }
    };

    async store(req: Request, res: Response) {
        const { name } = req.body;
        if (name == undefined) {
            addLog(
                `${req.session.username} cannot add category. error: the field cannot be empty`
            );
            res.render('addCategory',
                renderObject(req, {
                    'error': "The field cannot be empty"
                })
            );
        } else {
            const data = await prisma.categories.findFirst({
                where: {
                    'name': name
                }
            })
            if (data != null) {
                addLog(
                    `${req.session.username} cannot add category. error: name already taken`
                );
                res.render('addCategory',
                    renderObject(req, {
                        'error': "Name already taken"
                    })
                );
            } else {
                addLog(
                    `${req.session.username} add category name=${name}`
                );
                await prisma.categories.create({
                    data: {
                        'name': name
                    }
                });
                req.session.messageAlert = 'category created successfully';
                res.redirect('/categories');
            }
        }

    };
};
