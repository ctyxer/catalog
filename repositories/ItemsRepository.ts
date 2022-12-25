import { PrismaClient } from "@prisma/client";
import { LogToFile } from "../contracts/Logger/LogToFile";
import { Subject } from "../contracts/Observer/Subject";
import { stringData } from "../functions";
import { Repository } from "./Repository";

const prisma: PrismaClient = new PrismaClient();

export class ItemsRepository extends Repository implements Subject{
    constructor() {
        super();

        let logToFile = new LogToFile();

        this.attach(logToFile);
    }

    async index(){
        return prisma.items.findMany({
            'include': {
                category: true
            }
        });
    }

    async show(id: number){
        return prisma.items.findUnique({
            'where': {
                id: id
            },
            'include': {
                category: true,
                comments: true
            }
        });
    }

    async editItem(id: number){
        return prisma.items.findUnique({
            'where': {
                id: id
            },
            'include': {
                category: true
            }
        });
    }

    async editCategories(){
        return prisma.categories.findMany()
    }

    async create(){
        return prisma.categories.findMany()
    }

    async delete(id: number){
        await prisma.items.delete({
            where: {
                'id': id
            }
        })
    }

    async store(body: any, image: any, date: Date, author: string | undefined){
        await prisma.items.create({
            data: {
                'title': body.title,
                'image': String(image.name),
                'description': body.description,
                'author': author,
                'date': Number(date.getTime()),
                'date_creating': stringData(date.getTime()),
                'category_id': Number(body.categories)
            }
        });
    }

    async update(body: any, image: any){
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
        })
    }

    async search(search: string | undefined){
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

    async sort(){
        return prisma.items.findMany({
            'include': {
                category: true
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

    deleteLog(username: string, id: string){
        this.log(`user ${username} delete item by id=${id}`);
    }

    storeLog(username: string, title: string){
        this.log(`user ${username} create item: title=${title}`);
    }

    updateLog(username: string, id: string){
        this.log(`user ${username} update item: id=${id}`);
    }
}