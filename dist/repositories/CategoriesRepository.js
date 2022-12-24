"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesRepository = void 0;
const Repository_1 = require("./Repository");
const LogToFile_1 = require("../contracts/Logger/LogToFile");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CategoriesRepository extends Repository_1.Repository {
    constructor() {
        super();
        let logToFile = new LogToFile_1.LogToFile();
        this.attach(logToFile);
    }
    async index() {
        return prisma.categories.findMany();
    }
    async show(category_id) {
        return prisma.items.findMany({
            'where': {
                'category_id': category_id
            },
            'include': {
                category: true
            }
        });
    }
    async storeCreate(name, owner) {
        await prisma.categories.create({
            data: {
                'name': name,
                'owner': owner
            }
        });
    }
    async storeFindUniq(name) {
        return prisma.categories.findFirst({
            where: {
                'name': name
            }
        });
    }
    async delete(id) {
        await prisma.categories.delete({
            where: {
                id: id
            }
        });
    }
    async deleteUpdateItems(category_id) {
        await prisma.items.updateMany({
            where: { 'category_id': category_id },
            data: { 'category_id': 1 }
        });
    }
    log(message) {
        this.observers.forEach(observer => {
            observer.setMessage(message);
        });
        super.notify();
    }
    storeLog(username, name) {
        this.log(`${username} add category name=${name}`);
    }
    deleteLog(username, id) {
        this.observers.forEach(observer => {
            observer.setMessage(`user ${username} deleted category id=${id}`);
        });
        this.notify();
    }
}
exports.CategoriesRepository = CategoriesRepository;
