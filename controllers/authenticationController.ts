import { Request, Response } from 'express';
import { users, PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { Logger } from "../logs/logger";
import * as ip from 'ip';
import { renderObject } from '../functions';

const prisma: PrismaClient = new PrismaClient();
const logger = new Logger();

export class AuthenticationController {
    async login(req: Request, res: Response) {
        res.render("login",
            renderObject(req, {
                'error': ""
            }));
    };

    async register(req: Request, res: Response) {
        res.render("register",
            renderObject(req, {
                'error': ""
            }));
    };

    async logining(req: Request, res: Response) {
        const data = await prisma.users.findFirst({
            where: {
                username: req.body.username
            }
        })
        if (data != null) {
            if (await argon2.verify(String(data.password), String(req.body.password))) {
                req.session.auth = true;
                req.session.username = [req.body.username][0];
                logger.addLog(
                    `${ip.address()} is login on account ${req.session.username}`
                );
                res.redirect("/");
            }

            else {
                logger.addLog(
                    `${ip.address()} is error logining on account ${req.session.username}. error: password is not correct`
                );
                res.render("login",
                    renderObject(req, {
                        'error': "Password is not correct"
                    }));
            }
        }
        else {
            logger.addLog(
                `${ip.address()} is error logining on account ${req.session.username}. error: user does not exist`
            );
            res.render("login",
                renderObject(req, {
                    'error': "User does not exist"
                }));
        };
    };

    async logout(req: Request, res: Response) {
        await logger.addLog(
            `${ip.address()} is logout from account ${req.session.username}`
        );
        req.session.auth = false;
        req.session.username = undefined;
        res.redirect("/");
    };

    async registering(req: Request, res: Response) {
        if (req.body.username == "" || req.body.password == "") {
            logger.addLog(
                `${ip.address()} is error registering on account ${req.session.username}. error: the field cannot be empty`
            );
            res.render('register',
                renderObject(req, {
                    'error': "The field cannot be empty"
                }));
        } else {
            const data = await prisma.users.findFirst({
                where: {
                    username: req.body.username
                }
            })
            if (data != null) {
                logger.addLog(
                    `${ip.address()} is error registering on account ${req.session.username}. error: username already taken`
                );
                res.render('register',
                    renderObject(req, {
                        'error': "Username already taken"
                    }));
            } else {
                logger.addLog(
                    `${ip.address()} is registering on account ${req.session.username}`
                );
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
        };
    };
}