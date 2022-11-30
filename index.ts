import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import { items, PrismaClient, PrismaPromise } from "@prisma/client";
import path from 'path';
import md5 from "md5";

const prisma: PrismaClient = new PrismaClient();
const app: Express = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static("public"));

// Настройка шаблонизатора
app.set("view engine", "ejs");

// Путь к директории файлов отображения контента
app.set("views", path.join(__dirname, "views"));

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }));

// Инициализация сессии
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));

// Загрузка изображений на web-сервер
app.use(fileUpload());

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000);

function stringData(data: string) {
    let date = new Date(data);
    function addZero(number: number, col: number) {
        if (Number(col) - Number(String(number).length) >= 0) {
            return "0".repeat(Number(col) - Number(String(number).length)) + number;
        }
        else {
            return number;
        }
    }
    return String(
        addZero(date.getHours(), 2) +
        ":" +
        addZero(date.getMinutes(), 2) +
        " " +
        addZero(date.getDate(), 2) +
        "." +
        addZero(Number(date.getMonth() + 1), 2) +
        "." +
        date.getFullYear()
    );

}

/**
 * Маршруты
 */


//getters

app.get("/", async (req: Request, res) => {
    session.loyalPass = true;

    let data = await prisma.items.findMany();

    data = data.map(function (a: items) {
        return { ...a, date_creating: stringData(a.date_creating) };
    })
    res.render("home",
        {
            items: data,
            auth: session.auth,
            username: session.username,
        });
});

app.get("/items/:id", async (req, res) => {
    let data = await prisma.items.findMany({
        where: {
            id: Number(req.params.id)
        }
    })

    let data2 = await prisma.comments.findMany({
        where: {
            id: data[0].id
        }
    })

    data = data.map(function (a) {
        return { ...a, date_creating: stringData(a.date_creating) };
    })
    data2 = data2.map(function (a) {
        return { ...a, date: stringData(a.date_creating) };
    })

    res.render("item",
        {
            item: data[0],
            comments: data2,
            auth: session.auth,
            username: session.username,
        });
});

app.get("/items/:id/change", async (req, res) => {
    const data = await prisma.items.findMany({
        where: {
            id: Number(req.params.id)
        }
    })

    if (data[0].author != session.username) {
        res.redirect("/");
    } else {
        res.render("changeItem",
            {
                item: data[0],
                auth: session.auth,
                username: session.username,
            });
    }
});

app.get("/add", (req, res) => {
    if (session.auth != true) {
        res.redirect("/");
    } else {
        res.render("add",
            {
                auth: session.auth,
                username: session.username,
            });
    }
});

app.get("/login", (req, res) => {
    if (session.loyalPass == undefined) {
        session.loyalPass = true;
    }
    res.render("login",
        {
            auth: session.auth,
            loyalPass: session.loyalPass,
            username: session.username,
        });
});

app.get("/register", (req, res) => {
    if (session.errRegist == undefined) {
        session.errRegist = true;
    }
    res.render("register",
        {
            auth: session.auth,
            errRegist: session.errRegist,
            username: session.username,
        });
});

//postes

app.post("/login", async (req, res) => {
    let redir = "/login";
    const data = await prisma.users.findMany({
        where: {
            username: req.body.username
        }
    })

    if (data[0] == undefined) {
        session.loyalPass = "Аккаунт не существует";
    } else if (md5(String([req.body.password])) == String(data[0].password)) {
        redir = "/";
        session.auth = true;
        session.username = [req.body.username][0];
        session.loyalPass = true;
    } else {
        session.loyalPass = "Неверный логин или пароль";
    }
    res.redirect(redir);
});

app.post("/logout", (req, res) => {
    session.auth = false;
    session.username = undefined;
    res.redirect("/");
});

app.post("/register", async (req, res) => {

    let redir = "/register";
    if (req.body.username == "" || req.body.password == "") {
        session.errRegist = "Ни одно поле не может быть пустым";
        res.redirect(redir);
    } else {
        const data = await prisma.users.findMany({
            where: {
                username: req.body.username
            }
        })
        if (data[0] != undefined) {
            session.errRegist = "Имя уже занято";
            res.redirect(redir);
        } else {
            prisma.users.create({
                data: {
                    username: req.body.username,
                    password: md5(String(req.body.password)),
                    role: "user"
                }
            })
            redir = "/";
            session.auth = true;
            session.errRegist = true;
            session.username = [req.body.username][0];
            res.redirect(redir);

        }
    }
});

app.post("/add", (req: Request, res) => {    
    const { name } = req.files.image.name;
    req.files.image.mv("./public/img/" + name);
    let newName = md5(name.split(".")[0]) + name.split(".")[1];
    fs.rename("./public/img/" + name, "./public/img/" + newName, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
    prisma.items.create({
        data: {
            title: req.body.title,
            image: newName,
            description: req.body.description,
            author: session.username,
            date_creating: String(new Date())
        }
    })
    res.redirect("/");
});

app.post("/update", (req, res) => {
    try {
        fs.unlinkSync("./public/img/" + req.body.oldImage);
    }
    catch (err) {
        console.log("cannot delete old image: " + new Date())
    }
    try {
        req.files.image.mv("./public/img/" + req.files.image.name);
        let newName = "./public/img/" + md5(req.files.image.name.split(".")[0]) + ".wepb";
        fs.rename("./public/img/" + req.files.image.name, newName, function (err) {
            if (err) console.log('ERROR: ' + err);
        });
    }
    catch (err) { }
    function retImage() {
        try {
            return md5(req.files.image.name.split(".")[0]) + req.files.image.name.split(".")[1]
        }
        catch (err) {
            return req.body.oldImage
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
    })
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
    })
    prisma.comments.delete({
        where: {
            item_id: Number(req.body.id)
        }
    })

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
        })
    }
    res.redirect("/items/" + String([req.body.id]));
});

app.post("/deleteCommentary", (req, res) => {
    prisma.comments.delete({
        where: {
            id: Number(req.body.id)
        }
    })
    res.redirect("/items/" + String([req.body.id]));
});