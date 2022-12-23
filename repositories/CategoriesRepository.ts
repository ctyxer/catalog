import { Logger } from "../contracts/Logger/Logger";
import { Observer } from "../contracts/Observer/Observer";
import { Subject } from "../contracts/Observer/Subject";
import { Repository } from "./Repository";
import { LogToFile } from '../contracts/Logger/LogToFile';
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export class CategoriesRepository extends Repository implements Subject {
    constructor() {
        super();

        let logToFile = new LogToFile();

        this.attach(logToFile);
    }

    async store(category_id: number){
        return await prisma.items.findMany({
            'where': {
                'category_id': category_id
            },
            'include': {
                category: true
            }
        });
    }

    async create(name: string, owner: string){
        await prisma.categories.create({
            data: {
                'name': name,
                'owner': owner
            }
        });
    }

    async delete(id: number){
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

    log(message: string){
        this.observers.forEach(observer => {
            observer.setMessage(message);
        });

        this.notify();
    }

    storeLog(username: string, name: string) {
        // log message "Category ${name} created."

        this.log(`${username} add category name=${name}`)
    }

    deleteLog(username: string, id: number){
        this.observers.forEach(observer => {
            observer.setMessage(`user ${username} deleted category id=${id}`);
        });

        this.notify();   
    }
}