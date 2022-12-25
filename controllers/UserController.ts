import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import * as ip from 'ip';
import { renderObject } from '../functions';
import { UserRepository } from '../repositories/UserRepository';

const userRepository = new UserRepository();

export class UserController {
    async login(req: Request, res: Response) {
        res.render("login",
            renderObject(req, {
                'error': ""
            })
        );
    };

    async register(req: Request, res: Response) {
        res.render("register",
            renderObject(req, {
                'error': ""
            })
        );
    };

    async loginUser(req: Request, res: Response) {
        const data = await userRepository.loginUser(req.session.username);

        if (data != null) {
            if (await argon2.verify(String(data.password), String(req.body.password))) {
                req.session.auth = true;
                req.session.username = [req.body.username][0];
                userRepository.loginUserLog(ip.address(), String(req.session.username));
                res.redirect("/");
            } else {
                res.render("login",
                    renderObject(req, {
                        'error': "Password is not correct"
                    })
                );
            }
        } else {
            res.render("login",
                renderObject(req, {
                    'error': "User does not exist"
                })
            );
        };
    };

    async logout(req: Request, res: Response) {
        let username = req.session.username;
        userRepository.logoutLog(ip.address(), String(username));
        req.session.auth = false;
        req.session.username = undefined;
        res.redirect("/");
    };

    async registerUser(req: Request, res: Response) {
        if (req.body.username == "" || req.body.password == "") {
            res.render('register',
                renderObject(req, {
                    'error': "The field cannot be empty"
                })
            );
        } else {
            const data = await userRepository.registerUserFindFirst(req.session.username);
            if (data != null) {
                res.render('register',
                    renderObject(req, {
                        'error': "Username already taken"
                    })
                );
            } else {
                userRepository.registerUserLog(ip.address(), req.session.username);
                userRepository.registerUserCreate(req.session.username, req.body.password);
                req.session.auth = true;
                req.session.username = [req.body.username][0];
                res.redirect('/');
            }
        };
    };

    async show(req: Request, res: Response) {
        const { username } = req.params;
        const user = await userRepository.show(username);

        res.render('userpage', renderObject(req, { 'user': user }));
    };
}