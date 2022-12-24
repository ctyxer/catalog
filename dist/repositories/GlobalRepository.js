"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class GlobalRepository {
    async userPage(username) {
        return prisma.users.findFirst({
            where: {
                username: username
            }
        });
    }
}
exports.GlobalRepository = GlobalRepository;
