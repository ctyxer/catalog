import { Request, Response } from 'express';
import { items, comments, PrismaClient } from "@prisma/client";
import { stringData } from '../init';
import { UploadedFile } from 'express-fileupload';
declare module "express-fileupload" {
    interface UploadedFile {
        name: string
    }
};
import fs from "fs";

const prisma: PrismaClient = new PrismaClient();

export class ItemsController {
    async show(req: Request, res: Response) {

        let data = await prisma.items.findMany();

        data = data.map(function (a: items) {
            return { ...a, date_creating: stringData(a.date_creating) };
        })
        res.render("home",
            {
                items: data,
                auth: req.session.auth,
                username: req.session.username,
            });
    };

    async item(req: Request, res: Response) {
        let data = await prisma.items.findMany({
            where: {
                id: Number(req.params.id)
            }
        })

        let data2 = await prisma.comments.findMany({
            where: {
                id: data[0].id
            }
        })

        data = data.map(function (a) {
            return { ...a, date_creating: stringData(a.date_creating) };
        })
        data2 = data2.map(function (a) {
            return { ...a, date: stringData(a.date_creating) };
        })

        res.render("item",
            {
                item: data[0],
                comments: data2,
                auth: req.session.auth,
                username: req.session.username,
            });
    };

    async itemUpdate(req: Request, res: Response) {
        const data = await prisma.items.findMany({
            where: {
                id: Number(req.params.id)
            }
        })

        if (data[0].author != req.session.username) {
            res.redirect("/");
        } else {
            res.render("changeItem",
                {
                    item: data[0],
                    auth: req.session.auth,
                    username: req.session.username,
                });
        }
    }

    async add(req: Request, res: Response) {
        if (req.session.auth != true) {
            res.redirect("/");
        } else {
            res.render("add",
                {
                    auth: req.session.auth,
                    username: req.session.username,
                });
        }
    };

    async delete(req: Request, res: Response) {
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

        res.redirect("/");
    };
    async upload(req: Request, res: Response) {
        if (req.files != undefined) {
            await prisma.items.create({
                data: {
                    title: req.body.title,
                    image: String(req.files.image.name),
                    description: req.body.description,
                    author: String(req.session.username),
                    date_creating: String(new Date())
                }
            })
        }
        res.redirect("/");
    };

    async update(req: Request, res: Response) {
        try {
            fs.unlinkSync("./public/img/" + req.body.oldImage);
        }
        catch (err) { }
        if (req.files != undefined) {
            await prisma.items.update({
                data: {
                    title: req.body.title,
                    image: req.files.image.name,
                    description: req.body.description,
                },
                where: {
                    id: Number(req.body.id)
                }
            })
        };

        res.redirect("/");
    };
}