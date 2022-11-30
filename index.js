"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const md5_1 = __importDefault(require("md5"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
app.use(express_1.default.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
// Путь к директории файлов ресурсов (css, js, images)
app.use(express_1.default.static("public"));
// Настройка шаблонизатора
app.set("view engine", "ejs");
// Путь к директории файлов отображения контента
app.set("views", path_1.default.join(__dirname, "views"));
// Обработка POST-запросов из форм
app.use(express_1.default.urlencoded({ extended: true }));
// Инициализация сессии
app.use((0, express_session_1.default)({ secret: "Secret", resave: false, saveUninitialized: true }));
// Загрузка изображений на web-сервер
app.use((0, express_fileupload_1.default)());
// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000);
function stringData(data) {
    let date = new Date(data);
    function addZero(number, col) {
        if (Number(col) - Number(String(number).length) >= 0) {
            return "0".repeat(Number(col) - Number(String(number).length)) + number;
        }
        else {
            return number;
        }
    }
    return String(addZero(date.getHours(), 2) +
        ":" +
        addZero(date.getMinutes(), 2) +
        " " +
        addZero(date.getDate(), 2) +
        "." +
        addZero(Number(date.getMonth() + 1), 2) +
        "." +
        date.getFullYear());
}
/**
 * Маршруты
 */
//getters
app.get("/", async (req, res) => {
    express_session_1.default.loyalPass = true;
    let data = await prisma.items.findMany();
    data = data.map(function (a) {
        return Object.assign(Object.assign({}, a), { date_creating: stringData(a.date_creating) });
    });
    res.render("home", {
        items: data,
        auth: express_session_1.default.auth,
        username: express_session_1.default.username,
    });
});
app.get("/items/:id", async (req, res) => {
    let data = await prisma.items.findMany({
        where: {
            id: Number(req.params.id)
        }
    });
    let data2 = await prisma.comments.findMany({
        where: {
            id: data[0].id
        }
    });
    data = data.map(function (a) {
        return Object.assign(Object.assign({}, a), { date_creating: stringData(a.date_creating) });
    });
    data2 = data2.map(function (a) {
        return Object.assign(Object.assign({}, a), { date: stringData(a.date_creating) });
    });
    res.render("item", {
        item: data[0],
        comments: data2,
        auth: express_session_1.default.auth,
        username: express_session_1.default.username,
    });
});
app.get("/items/:id/change", async (req, res) => {
    const data = await prisma.items.findMany({
        where: {
            id: Number(req.params.id)
        }
    });
    if (data[0].author != express_session_1.default.username) {
        res.redirect("/");
    }
    else {
        res.render("changeItem", {
            item: data[0],
            auth: express_session_1.default.auth,
            username: express_session_1.default.username,
        });
    }
});
app.get("/add", (req, res) => {
    if (express_session_1.default.auth != true) {
        res.redirect("/");
    }
    else {
        res.render("add", {
            auth: express_session_1.default.auth,
            username: express_session_1.default.username,
        });
    }
});
app.get("/login", (req, res) => {
    if (express_session_1.default.loyalPass == undefined) {
        express_session_1.default.loyalPass = true;
    }
    res.render("login", {
        auth: express_session_1.default.auth,
        loyalPass: express_session_1.default.loyalPass,
        username: express_session_1.default.username,
    });
});
app.get("/register", (req, res) => {
    if (express_session_1.default.errRegist == undefined) {
        express_session_1.default.errRegist = true;
    }
    res.render("register", {
        auth: express_session_1.default.auth,
        errRegist: express_session_1.default.errRegist,
        username: express_session_1.default.username,
    });
});
//postes
app.post("/login", async (req, res) => {
    let redir = "/login";
    const data = await prisma.users.findMany({
        where: {
            username: req.body.username
        }
    });
    if (data[0] == undefined) {
        express_session_1.default.loyalPass = "Аккаунт не существует";
    }
    else if ((0, md5_1.default)(String([req.body.password])) == String(data[0].password)) {
        redir = "/";
        express_session_1.default.auth = true;
        express_session_1.default.username = [req.body.username][0];
        express_session_1.default.loyalPass = true;
    }
    else {
        express_session_1.default.loyalPass = "Неверный логин или пароль";
    }
    res.redirect(redir);
});
app.post("/logout", (req, res) => {
    express_session_1.default.auth = false;
    express_session_1.default.username = undefined;
    res.redirect("/");
});
app.post("/register", async (req, res) => {
    let redir = "/register";
    if (req.body.username == "" || req.body.password == "") {
        express_session_1.default.errRegist = "Ни одно поле не может быть пустым";
        res.redirect(redir);
    }
    else {
        const data = await prisma.users.findMany({
            where: {
                username: req.body.username
            }
        });
        if (data[0] != undefined) {
            express_session_1.default.errRegist = "Имя уже занято";
            res.redirect(redir);
        }
        else {
            prisma.users.create({
                data: {
                    username: req.body.username,
                    password: (0, md5_1.default)(String(req.body.password)),
                    role: "user"
                }
            });
            redir = "/";
            express_session_1.default.auth = true;
            express_session_1.default.errRegist = true;
            express_session_1.default.username = [req.body.username][0];
            res.redirect(redir);
        }
    }
});
app.post("/add", (req, res) => {
    const { name } = req.files.image.name;
    req.files.image.mv("./public/img/" + name);
    let newName = (0, md5_1.default)(name.split(".")[0]) + name.split(".")[1];
    fs.rename("./public/img/" + name, "./public/img/" + newName, function (err) {
        if (err)
            console.log('ERROR: ' + err);
    });
    prisma.items.create({
        data: {
            title: req.body.title,
            image: newName,
            description: req.body.description,
            author: express_session_1.default.username,
            date_creating: String(new Date())
        }
    });
    res.redirect("/");
});
app.post("/update", (req, res) => {
    try {
        fs.unlinkSync("./public/img/" + req.body.oldImage);
    }
    catch (err) {
        console.log("cannot delete old image: " + new Date());
    }
    try {
        req.files.image.mv("./public/img/" + req.files.image.name);
        let newName = "./public/img/" + (0, md5_1.default)(req.files.image.name.split(".")[0]) + ".wepb";
        fs.rename("./public/img/" + req.files.image.name, newName, function (err) {
            if (err)
                console.log('ERROR: ' + err);
        });
    }
    catch (err) { }
    function retImage() {
        try {
            return (0, md5_1.default)(req.files.image.name.split(".")[0]) + req.files.image.name.split(".")[1];
        }
        catch (err) {
            return req.body.oldImage;
        }
    }
    prisma.items.update({
        data: {
            title: req.body.title,
            image: retImage(),
            description: req.body.description,
        },
        where: {
            id: Number(req.body.id)
        }
    });
    res.redirect("/");
    ;
});
app.post("/delete", (req, res) => {
    try {
        fs.unlinkSync("./public/img/" + req.body.oldImage);
    }
    catch (err) { }
    prisma.items.delete({
        where: {
            id: Number(req.body.id)
        }
    });
    prisma.comments.delete({
        where: {
            item_id: Number(req.body.id)
        }
    });
    res.redirect("/");
});
app.post("/addCommentary", (req, res) => {
    if (req.body.commentary != "") {
        let date = new Date();
        prisma.connect.create({
            data: {
                author: req.session.username,
                commentary: req.body.commentary,
                date_creating: new Date(),
                item_id: String(req.body.id)
            }
        });
    }
    res.redirect("/items/" + String([req.body.id]));
});
app.post("/deleteCommentary", (req, res) => {
    prisma.comments.delete({
        where: {
            id: Number(req.body.id)
        }
    });
    res.redirect("/items/" + String([req.body.id]));
});
