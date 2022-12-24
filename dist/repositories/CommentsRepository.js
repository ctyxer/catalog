"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsRepository = void 0;
const client_1 = require("@prisma/client");
const LogToFile_1 = require("../contracts/Logger/LogToFile");
const Repository_1 = require("./Repository");
const prisma = new client_1.PrismaClient();
class CommentsRepository extends Repository_1.Repository {
    constructor() {
        super();
        let logToFile = new LogToFile_1.LogToFile();
        this.attach(logToFile);
    }
    async store(author, commentary, date_creating, item_id) {
        await prisma.comments.create({
            data: {
                author: author,
                commentary: commentary,
                date_creating: date_creating,
                item_id: item_id
            }
        });
    }
}
exports.CommentsRepository = CommentsRepository;
