import { Prisma, PrismaClient } from "@prisma/client";
import { LogToFile } from "../contracts/Logger/LogToFile";
import { Subject } from "../contracts/Observer/Subject";
import { Repository } from "./Repository";

const prisma: PrismaClient = new PrismaClient();

export class CommentsRepository extends Repository implements Subject{
    constructor() {
        super();

        let logToFile = new LogToFile();

        this.attach(logToFile);
    }

    async store(author: string, commentary: string, date_creating: string, item_id: number){
        await prisma.comments.create({
            data: {
                author: author,
                commentary: commentary,
                date_creating: date_creating,
                item_id: item_id
            }
        })
    }

    async delete(id: number){
        await prisma.comments.delete({
            where: {
                id: id
            }
        })
    }

    async show(id: number, skip: number){
        return await prisma.comments.findMany({
            take: 20,
            skip: skip,
            where: {
                item_id: id
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

    storeLog(username: string, id: string){
        this.log(`user ${username} upload comment on item by id=${id}`);
    }

    deleteLog(username: string | undefined, id: string){
        this.log(`user ${username} delete comment id=${id}`);
    }
}