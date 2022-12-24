"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsRepository = void 0;
const client_1 = require("@prisma/client");
const LogToFile_1 = require("../contracts/Logger/LogToFile");
const functions_1 = require("../functions");
const Repository_1 = require("./Repository");
const prisma = new client_1.PrismaClient();
class ItemsRepository extends Repository_1.Repository {
    constructor() {
        super();
        let logToFile = new LogToFile_1.LogToFile();
        this.attach(logToFile);
    }
    async index() {
        return prisma.items.findMany({
            'include': {
                category: true
            }
        });
    }
    async show(id) {
        prisma.items.findUnique({
            'where': {
                id: id
            },
            'include': {
                category: true,
                comments: true
            }
        });
    }
    async editItem(id) {
        return prisma.items.findUnique({
            'where': {
                id: id
            },
            'include': {
                category: true
            }
        });
    }
    async editCategories() {
        return prisma.categories.findMany();
    }
    async create() {
        return prisma.categories.findMany();
    }
    async delete(id) {
        await prisma.items.delete({
            where: {
                'id': id
            }
        });
    }
    async store(body, image, date, author) {
        await prisma.items.create({
            data: {
                'title': body.title,
                'image': String(image.name),
                'description': body.description,
                'author': author,
                'date': Number(date.getTime()),
                'date_creating': (0, functions_1.stringData)(date.getTime()),
                'category_id': Number(body.categories)
            }
        });
    }
    async update(body, image) {
        await prisma.items.update({
            data: {
                'title': body.title,
                'image': image.name,
                'description': body.description,
                'category_id': Number(body.categories)
            },
            where: {
                'id': Number(body.id)
            }
        });
    }
    async search(search) {
        return prisma.items.findMany({
            where: {
                'title': {
                    contains: search
                }
            },
            include: {
                category: true
            }
        });
    }
    async sort() {
        return prisma.items.findMany({
            'include': {
                category: true
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
    deleteLog(username, id) {
        this.log(`user ${username} delete item by id=${id}`);
    }
    storeLog(username, title) {
        this.log(`user ${username} create item: title=${title}`);
    }
    updateLog(username, id) {
        this.log(`user ${username} update item: id=${id}`);
    }
}
exports.ItemsRepository = ItemsRepository;
