import { items, comments, PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';
import fs from "fs";
import { Logger } from "../logs/logger";
import { stringData, renderObject } from '../functions';

const prisma: PrismaClient = new PrismaClient();
const logger = new Logger();

export class ItemsController {
    async show(req: Request, res: Response) {
        logger.catcherErr(async () => {
            let data = await prisma.items.findMany({
                include: {
                    category: true
                }
            });
            console.log(data)
            data = data.map(function (a: items) {
                return { ...a, date_creating: stringData(String(a.date_creating)) };
            })
            res.render("items",
                renderObject(req, { 'items': data })
            );
        });
    };

    async item(req: Request, res: Response) {
        logger.catcherErr(async () => {
            let data = await prisma.items.findMany({
                where: {
                    id: Number(req.params.id)
                },
                include: {
                    category: true
                }
            })

            let data2 = await prisma.comments.findMany({
                where: {
                    item_id: Number(req.params.id)
                }
            })

            data = data.map((a) => {
                return { ...a, date_creating: stringData(String(a.date_creating)) };
            })
            data2 = data2.map(function (a) {
                return { ...a, date: stringData(String(a.date_creating)) }
            })

            res.render("item",
                renderObject(req, {
                    'item': data[0],
                    'comments': data2,
                    'username': req.session.username
                }));
        });
    };

    async itemUpdate(req: Request, res: Response) {
        logger.catcherErr(async () => {
            const data = await prisma.items.findMany({
                where: {
                    id: Number(req.params.id)
                }, 
                include: {
                    category: true
                }
            })

            if (data[0].author != req.session.username) {
                res.redirect("/items");
            } else {
                const categories = await prisma.categories.findMany();
                res.render("changeItem",
                    renderObject(req, {
                        'item': data[0], 
                        'categories': categories
                    }));
            }
        });
    }

    async addGet(req: Request, res: Response) {
        logger.catcherErr(async () => {
            if (req.session.auth != true) {
                res.redirect("/");
            } else {
                const categories = await prisma.categories.findMany();
                res.render("add",
                    renderObject(req, { 'categories': categories }));
            }
        });
    };

    async delete(req: Request, res: Response) {
        logger.catcherErr(async () => {
            try {
                fs.unlinkSync("./public/img/" + req.body.oldImage);
            }
            catch (err) { }
            await prisma.comments.deleteMany({
                where: {
                    item_id: Number(req.body.id)
                }
            })
            await prisma.items.delete({
                where: {
                    id: Number(req.body.id)
                }
            })
            logger.addLog(
                `user ${req.session.username} delete item by id=${req.body.id}, delete comments by item_id=${req.body.id}`
            )

            res.redirect("/items");
        });
    };
    async addPost(req: Request, res: Response) {
        logger.catcherErr(async () => {
            if (req.files != undefined) {
                req.files.image.mv("./public/img/" + req.files.image.name);
                const date = String(new Date().getTime())
                await prisma.items.create({
                    data: {
                        title: req.body.title,
                        image: String(req.files.image.name),
                        // image: '/',
                        description: req.body.description,
                        author: String(req.session.username),
                        date_creating: date,
                        'category_id': Number(req.body.categories)
                    }
                });
                logger.addLog(
                    `user ${req.session.username} create item: title=${req.body.title}, date_creating=${date}`
                );
            }
            res.redirect("/items");
        })
    };

    async update(req: Request, res: Response) {
        logger.catcherErr(async () => {
            let image = req.body.oldImage;
            if (req.files != undefined) {
                try {
                    fs.unlinkSync("./public/img/" + req.body.oldImage);
                }
                catch (err) { }

                image = req.files.image.name;
                req.files.image.mv("./public/img/" + image);
            };
            await prisma.items.update({
                data: {
                    title: req.body.title,
                    image: image,
                    description: req.body.description,
                    'category_id': Number(req.body.categories)
                },
                where: {
                    id: Number(req.body.id)
                }
            })
            logger.addLog(
                `user ${req.session.username} update item: id=${req.body.id}`
            )

            res.redirect("/items");
        });
    };
}