const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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