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
    async store(category_id) {
        return await prisma.items.findMany({
            'where': {
                'category_id': category_id
            },
            'include': {
                category: true
            }
        });
    }
    async create(name, owner) {
        await prisma.categories.create({
            data: {
                'name': name,
                'owner': owner
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
    /**
     * index
     * update
     * store
     * destroy
     * show
     */
    log(message) {
        this.observers.forEach(observer => {
            observer.setMessage(message);
        });
        this.notify();
    }
    storeLog(username, name) {
        // log message "Category ${name} created."
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
