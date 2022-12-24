import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export class GlobalRepository{
    async userPage(username: string){
        return prisma.users.findFirst({
            where: {
                username: username
            }
        });
    }
}