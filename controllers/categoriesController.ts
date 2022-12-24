import { Request, Response } from 'express';
import { renderObject } from '../functions';
import { CategoriesRepository } from '../repositories/CategoriesRepository';

let categoriesRepository = new CategoriesRepository();

export class CategoriesController {
    async index(req: Request, res: Response) {
        const categories = await categoriesRepository.index();

        res.render('categories',
            renderObject(req, {
                'categories': categories,
                'username': req.session.username
            })
        );
    };

    async show(req: Request, res: Response) {
        const { id } = req.params; 

        let data = await categoriesRepository.show(Number(id));
        
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
            // cannot add category. error: the field cannot be empty
            res.render('addCategory',
                renderObject(req, {
                    'error': "The field cannot be empty"
                })
            );
        } else {
            const data = await categoriesRepository.storeFindUniq(name);
            if (data != null) {
                // cannot add category. error: name already taken
                res.render('addCategory',
                    renderObject(req, {
                        'error': "Name already taken"
                    })
                );
            } else {
                // add category name=${name}
                categoriesRepository.storeLog(String(req.session.username), name);
                categoriesRepository.storeCreate(name, owner);
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

            categoriesRepository.deleteUpdateItems(Number(id));

            categoriesRepository.delete(Number(id));
            categoriesRepository.deleteLog(String(req.session.username), id);
            req.session.messageAlert = 'category deleted successfully';
            res.redirect('/categories');
        }
    };
};