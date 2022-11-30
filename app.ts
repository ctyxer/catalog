import { items, PrismaClient, PrismaPromise } from "@prisma/client";
const prisma: PrismaClient = new PrismaClient();

(async () => {
    let data = await prisma.items.findMany();
    
    data = data.map(function (a: items) {
        return { ...a, date_creating: String(a.date_creating) };
    })
    console.log("done")
})()