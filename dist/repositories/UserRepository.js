"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const LogToFile_1 = require("../contracts/Logger/LogToFile");
const LogToTelegram_1 = require("../contracts/Logger/LogToTelegram");
const Repository_1 = require("./Repository");
const argon2 = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
class UserRepository extends Repository_1.Repository {
    constructor() {
        super();
        const logToFile = new LogToFile_1.LogToFile();
        const logToTelegram = new LogToTelegram_1.LogToTelegram();
        this.attach(logToFile);
        this.attach(logToTelegram);
    }
    async loginUser(username) {
        return prisma.users.findFirst({
            where: {
                username: username
            }
        });
    }
    async registerUserFindFirst(username) {
        return prisma.users.findFirst({
            where: {
                username: username
            }
        });
    }
    async registerUserCreate(username, password) {
        await prisma.users.create({
            data: {
                username: username,
                password: await argon2.hash(String(password)),
                role: "user"
            }
        });
    }
    async show(username) {
        return prisma.users.findFirst({
            where: {
                'username': username
            }
        });
    }
    //log
    log(message) {
        this.observers.forEach(observer => {
            observer.setMessage(message);
        });
        super.notify();
    }
    loginUserLog(ip, username) {
        this.log(`${ip} is login on account ${username}`);
    }
    logoutLog(ip, username) {
        this.log(`${ip} is logout from account ${username}`);
    }
    registerUserLog(ip, username) {
        `${ip} is registering on account ${username}`;
    }
}
exports.UserRepository = UserRepository;
