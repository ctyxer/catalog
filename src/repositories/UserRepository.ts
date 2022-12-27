import { PrismaClient } from "@prisma/client";
import { LogToFile } from "../contracts/Logger/LogToFile";
import { LogToTelegram } from "../contracts/Logger/LogToTelegram";
import { Subject } from "../contracts/Observer/Subject";
import { Repository } from "./Repository";
import * as argon2 from "argon2";

const prisma: PrismaClient = new PrismaClient();

export class UserRepository extends Repository implements Subject{

    constructor() {
        super();

        const logToFile = new LogToFile();
        const logToTelegram = new LogToTelegram();

        this.attach(logToFile);
        // this.attach(logToTelegram);
    }

    async loginUser(username: string | undefined){
        return prisma.users.findFirst({
            where: {
                username: username
            }
        })
    }

    async registerUserFindFirst(username: string | undefined){
        return prisma.users.findFirst({
            where: {
                username: username
            }
        })
    }

    async registerUserCreate(username: string | undefined, password: string | undefined){
        await prisma.users.create({
            data: {
                username: username,
                password: await argon2.hash(String(password)),
                role: "user"
            }
        });
    }

    async show(username: string | undefined){
        return prisma.users.findFirst({
            where: {
                'username': username
            }
        });
    }

    //log
    log(message: string){
        this.observers.forEach(observer => {
            observer.setMessage(message);
        });

        super.notify();
    }

    loginUserLog(ip: string | number, username: string){
        this.log(`${ip} is login on account ${username}`);
        
    }

    logoutLog(ip: string | number, username: string){
        this.log(`${ip} is logout from account ${username}`);
    }

    registerUserLog(ip: number | string, username: string | undefined){
        `${ip} is registering on account ${username}`
    }
}