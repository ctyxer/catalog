import { PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import { renderObject, sortAlfabet, sortDate } from '../functions';
import { ItemsRepository } from "../repositories/ItemsRepository";

const prisma: PrismaClient = new PrismaClient();
const itemsRepository = new ItemsRepository();

export class ItemsController {
    async index(req: Request, res: Response) {
        let data = await itemsRepository.index();

        res.render("items",
            renderObject(req, { 'items': data })
        );
    };

    async show(req: Request, res: Response) {
        let data = await itemsRepository.show(Number(req.params.id));

        res.render("item",
            renderObject(req, {
                'item': data,
                'username': req.session.username
            })
        );
    };

    async edit(req: Request, res: Response) {
        const data = await itemsRepository.editItem(Number(req.params.id));

        if (data != null && data.author != req.session.username) {
            res.redirect("/items");
        } else {
            const categories = await itemsRepository.editCategories();
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
            const categories = await itemsRepository.create();
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
        itemsRepository.delete(Number(req.body.id))
        itemsRepository.deleteLog(String(req.session.username), req.body.id)

        req.session.messageAlert = 'item deleted successfully'
        res.redirect("/items");
    };

    async store(req: Request, res: Response) {
        if (req.files != undefined) {
            const image = req.files.image as UploadedFile;
            image.mv("./public/img/" + image.name);
            const date = new Date();

            itemsRepository.store(req.body, image, date, String(req.session.username));
            itemsRepository.storeLog(String(req.session.username), req.body.title);
            req.session.messageAlert = 'item created successfully'
        }
        res.redirect("/items");
    };

    async update(req: Request, res: Response) {
        if (req.files != undefined) {
            const oldImage = req.body.oldImage;

            try {
                fs.unlinkSync("./public/img/" + oldImage);
            }
            catch (err) { }

            const image = req.files.image as UploadedFile;
            image.mv("./public/img/" + image.name);

            itemsRepository.update(req.body, image);
            itemsRepository.updateLog(String(req.session.username), req.body.id)
            req.session.messageAlert = 'item updated successfully'
        };
        res.redirect("/items");
    };

    async search(req: Request, res: Response) {
        const { search } = req.body;
        const items = itemsRepository.search(search);

        res.render("items",
            renderObject(req, { 'items': items, 'search': search })
        );
    };

    async sortAlfabet(req: Request, res: Response) {
        let items = await itemsRepository.sort();

        items = sortAlfabet(items);

        res.render("items",
            renderObject(req, { 'items': items })
        );
    }

    async sortDate(req: Request, res: Response) {
        let items = await itemsRepository.sort();

        items = sortDate(items);

        res.render("items",
            renderObject(req, { 'items': items })
        );
    }
}