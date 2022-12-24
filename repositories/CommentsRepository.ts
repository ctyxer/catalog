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
}