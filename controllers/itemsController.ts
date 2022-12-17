import { items, comments, categories, PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';
import fs from "fs";
import { stringData, renderObject } from '../functions';
import { addLog } from "../logs/addLog";

const prisma: PrismaClient = new PrismaClient();

export class ItemsController {
    async index(req: Request, res: Response) {
        let data = await prisma.items.findMany({
            'include': {
                category: true
            }
        });
        
        res.render("items",
            renderObject(req, { 'items': data })
        );
    };

    async show(req: Request, res: Response) {
        let data = await prisma.items.findUnique({
            'where': {
                id: Number(req.params.id)
            },
            'include': {
                category: true,
                comments: true
            }
        });

        res.render("item",
            renderObject(req, {
                'item': data,
                'username': req.session.username
            })
        );
    };

    async edit(req: Request, res: Response) {
        const data = await prisma.items.findUnique({
            'where': {
                id: Number(req.params.id)
            },
            'include': {
                category: true
            }
        });

        if (data != null && data.author != req.session.username) {
            res.redirect("/items");
        } else {
            const categories = await prisma.categories.findMany();
            res.render("changeItem",
                renderObject(req, {
                    'item': data,
                    'categories': categories
                })
            );
        };
    }

    async create(req: Request, res: Response) {
        if (req.session.auth != true) {
            res.redirect("/");
        } else {
            const categories = await prisma.categories.findMany();
            res.render("add",
                renderObject(req, { 'categories': categories })
            );
        };
    };

    async delete(req: Request, res: Response) {
        try {
            fs.unlinkSync("./public/img/" + req.body.oldImage);
        }
        catch (err) { }
        await prisma.items.delete({
            where: {
                'id': Number(req.body.id)
            }
        })
        addLog(
            `user ${req.session.username} delete item by id=${req.body.id}, delete comments by item_id=${req.body.id}`
        )

        req.session.messageAlert = 'item deleted successfully'
        res.redirect("/items");
    };

    async store(req: Request, res: Response) {
        if (req.files != undefined) {
            req.files.image.mv("./public/img/" + req.files.image.name);
            const date = String(new Date().getTime())
            await prisma.items.create({
                data: {
                    'title': req.body.title,
                    'image': String(req.files.image.name),
                    'description': req.body.description,
                    'author': String(req.session.username),
                    'date_creating': stringData(date),
                    'category_id': Number(req.body.categories)
                }
            });
            addLog(
                `user ${req.session.username} create item: title=${req.body.title}, date_creating=${date}`
            );
            req.session.messageAlert = 'item created successfully'
        }
        res.redirect("/items");
    };

    async update(req: Request, res: Response) {
        let image = req.body.oldImage;
        if (req.files != undefined) {
            try {
                fs.unlinkSync("./public/img/" + req.body.oldImage);
            }
            catch (err) {}

            image = req.files.image.name;
            req.files.image.mv("./public/img/" + image);
        };
        await prisma.items.update({
            data: {
                'title': req.body.title,
                'image': image,
                'description': req.body.description,
                'category_id': Number(req.body.categories)
            },
            where: {
                'id': Number(req.body.id)
            }
        })
        addLog(
            `user ${req.session.username} update item: id=${req.body.id}`
        );
        req.session.messageAlert = 'item updated successfully'
        res.redirect("/items");
    };
}