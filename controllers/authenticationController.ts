import { Request, Response } from 'express';
import { users, PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma: PrismaClient = new PrismaClient();

export class AuthenticationController {
    async login(req: Request, res: Response) {
        res.render("login",
            {
                error: "",
                auth: req.session.auth,
                username: req.session.username,
            });
    };

    async register (req: Request, res: Response) {
        res.render("register",
            {
                error: "",
                auth: req.session.auth,
                username: req.session.username,
            });
    };

    async logining (req: Request, res: Response) {
        const data = await prisma.users.findFirst({
            where: {
                username: req.body.username
            }
        })
        if (data != null) {
            if (await argon2.verify(String(data.password), String(req.body.password))) {
                req.session.auth = true;
                req.session.username = [req.body.username][0];
                res.redirect("/")
            }
        }
        else res.render("login", {
            error: "The user does not exist",
            auth: req.session.auth,
            username: req.session.username,
        });
    };

    async logout (req: Request, res: Response) {
        req.session.auth = false;
        req.session.username = undefined;
        res.redirect("/");
    };

    async registering (req: Request, res: Response) {
        if (req.body.username == "" || req.body.password == "") {
            res.render('register', {
                error: "The field cannot be empty",
                auth: req.session.auth,
                username: req.session.username
            });
        } else {
            const data = await prisma.users.findFirst({
                where: {
                    username: req.body.username
                }
            })
            if (data != null) {
                res.render('register', {
                    error: "Username already taken",
                    auth: req.session.auth,
                    username: req.session.username,
                });
            } else {
                await prisma.users.create({
                    data: {
                        username: req.body.username,
                        password: await argon2.hash(String(req.body.password)),
                        role: "user"
                    }
                });
                req.session.auth = true;
                req.session.username = [req.body.username][0];
                res.redirect('/');
            }
        }
    };
}