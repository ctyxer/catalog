const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.categories.delete();
    await prisma.items.delete();
    await prisma.users.delete();
    const createMany = await prisma.categories.createMany({
        data: [
            { name: "None" }
        ],
        skipDuplicates: true
        }
    );
    console.log("done!")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.log(e);
        await prisma.$disconnect();
        process.exit(1); 
    })