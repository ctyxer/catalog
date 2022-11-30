"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
(async () => {
    let data = await prisma.items.findMany();
    data = data.map(function (a) {
        return Object.assign(Object.assign({}, a), { date_creating: String(a.date_creating) });
    });
    console.log("done");
})();
