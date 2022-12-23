import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { renderObject } from '../functions';
import { CategoriesRepository } from '../repositories/CategoriesRepository';

const prisma: PrismaClient = new PrismaClient();

let categoriesRepository = new CategoriesRepository();

export class CategoriesController {
    async index(req: Request, res: Response) {
        const categories = await prisma.categories.findMany();

        res.render('categories',
            renderObject(req, {
                'categories': categories,
                'username': req.session.username
            })
        );
    };

    async show(req: Request, res: Response) {
        const { id } = req.params; 

        // CategoriesRepository.findById()

        let data = categoriesRepository.store(Number(id));
        
        res.render("items",
            renderObject(req, { 'items': data })
        );
    };

    async create(req: Request, res: Response) {
        if (req.session.auth != true) {
            res.redirect("/");
        } else {
            res.render("addCategory",
                renderObject(req, {
                    'error': '',
                    'username': req.session.username
                })
            );
        }
    };

    async store(req: Request, res: Response) {
        const { name, owner } = req.body;
        if (name == undefined) {
            // addLog(
            //     `${req.session.username} cannot add category. error: the field cannot be empty`
            // );
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
                // addLog(
                //     `${req.session.username} cannot add category. error: name already taken`
                // );
                res.render('addCategory',
                    renderObject(req, {
                        'error': "Name already taken"
                    })
                );
            } else {
                // addLog(
                //     `${req.session.username} add category name=${name}`
                // );
                categoriesRepository.storeLog(String(req.session.username), name);
                categoriesRepository.create(name, owner);
                req.session.messageAlert = 'category created successfully';
                res.redirect('/categories');
            }
        }
    };

    async delete(req: Request, res: Response) {
        if (req.session.auth != true) {
            res.redirect("/");
        } else {
            const { id } = req.body;

            await prisma.items.updateMany({
                where: { 'category_id': Number(id) },
                data: { 'category_id': Number(1) }
            });

            categoriesRepository.delete(Number(id));
            categoriesRepository.deleteLog(String(req.session.username), id);
            req.session.messageAlert = 'category deleted successfully';
            res.redirect('/categories');
        }
    };
};
