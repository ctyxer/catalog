import { Request, Response } from 'express';
import { users, PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { Logger } from "../logs/logger";
import * as ip from 'ip';

const prisma: PrismaClient = new PrismaClient();
const logger = new Logger();

export class AuthenticationController {
    async login(req: Request, res: Response) {
        logger.catcherErr(() => {
            res.render("login",
                {
                    error: "",
                    auth: req.session.auth,
                    username: req.session.username,
                });
        });
    };

    async register(req: Request, res: Response) {
        logger.catcherErr(() => {
            res.render("register",
                {
                    error: "",
                    auth: req.session.auth,
                    username: req.session.username,
                });
        });
    };

    async logining(req: Request, res: Response) {
        logger.catcherErr(async () => {
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
                        `${ip.address()} is login on account ${req.body.username}`
                    );
                    res.redirect("/");
                }

                else {
                    logger.addLog(
                        `${ip.address()} is error logining on account ${req.body.username}. error: password is not correct`
                    );
                    res.render("login", {
                        error: "Password is not correct",
                        auth: req.session.auth,
                        username: req.session.username,
                    });
                }
            }
            else {
                logger.addLog(
                    `${ip.address()} is error logining on account ${req.body.username}. error: user does not exist`
                );
                res.render("login", {
                    error: "The user does not exist",
                    auth: req.session.auth,
                    username: req.session.username,
                });
            }
        });
    };

    async logout(req: Request, res: Response) {
        logger.catcherErr(() => {
            logger.addLog(
                `${ip.address()} is logout from account ${req.body.username}`
            );
            req.session.auth = false;
            req.session.username = undefined;
            res.redirect("/");
        });
    };

    async registering(req: Request, res: Response) {
        logger.catcherErr(async () => {
            if (req.body.username == "" || req.body.password == "") {
                logger.addLog(
                    `${ip.address()} is error registering on account ${req.body.username}. error: the field cannot be empty`
                );
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
                    logger.addLog(
                        `${ip.address()} is error registering on account ${req.body.username}. error: username already taken`
                    );
                    res.render('register', {
                        error: "Username already taken",
                        auth: req.session.auth,
                        username: req.session.username,
                    });
                } else {
                    logger.addLog(
                        `${ip.address()} is registering on account ${req.body.username}`
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
            }
        });
    };
}