import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import path from 'path';
import { ItemsController } from './controllers/itemsController';
import { AuthenticationController } from './controllers/authenticationController';
import { CommentariesController } from './controllers/commentariesController';

const app: Express = express();

//Controllers
const itemsController = new ItemsController();
const authenticationController = new AuthenticationController();
const commentariesController = new CommentariesController();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(6000, () => {
    console.log('Server is running on port 5000');
});

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static("public"));

// Настройка шаблонизатора
app.set("view engine", "ejs");

// Путь к директории файлов отображения контента
app.set("views", path.join(__dirname, "./views"));

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }));

// Инициализация сессии
declare module "express-session" {
    interface SessionData {
        auth: boolean,
        username: string
    }
};
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));

// Загрузка изображений на web-сервер
app.use(fileUpload());

// Запуск веб-сервера по адресу http://localhost:5000
app.listen(5000);


/**
 * Маршруты
 */


//getters

app.get("/", async (req: Request, res: Response) => {
    itemsController.show(req, res);
});

app.get("/items/:id", async (req: Request, res: Response) => {
    itemsController.item(req, res);
});

app.get("/items/:id/change", async (req: Request, res: Response) => {
    itemsController.itemUpdate(req, res);
});

app.get("/addItem", async (req: Request, res: Response) => {
    itemsController.add(req, res);
});

app.get("/login", async (req: Request, res: Response) => {
    authenticationController.login(req, res);
});

app.get("/register", async (req: Request, res: Response) => {
    authenticationController.register(req, res);
});

//postes

app.post("/logining", async (req: Request, res: Response) => {
    authenticationController.logining(req, res);
});

app.post("/logout", async (req: Request, res: Response) => {
    req.session.auth = false;
    req.session.username = undefined;
    res.redirect("/");
});

app.post("/registering", async (req: Request, res: Response) => {
    authenticationController.registering(req, res);
});

// app.post("/add", async (req: Request, res: Response) => {
//     const { name } =  req.files.image.name;
//     req.files.image.mv("./public/img/" + name);
//     let newName = md5(name.split(".")[0]) + name.split(".")[1];
//     fs.rename("./public/img/" + name, "./public/img/" + newName, function (err) {
//         if (err) console.log('ERROR: ' + err);
//     });
//     await prisma.items.create({
//         data: {
//             title: req.body.title,
//             image: newName,
//             description: req.body.description,
//             author: String(req.session.username),
//             date_creating: String(new Date())
//         }
//     })
//     res.redirect("/");
// });

// app.post("/update", (req: Request, res: Response) => {
//     try {
//         fs.unlinkSync("./public/img/" + req.body.oldImage);
//     }
//     catch (err) {
//         console.log("cannot delete old image: " + new Date())
//     }
//     try {
//         req.files.image.mv("./public/img/" + req.files.image.name);
//         let newName = "./public/img/" + md5(req.files.image.name.split(".")[0]) + ".wepb";
//         fs.rename("./public/img/" + req.files.image.name, newName, function (err) {
//             if (err) console.log('ERROR: ' + err);
//         });
//     }
//     catch (err) { }
//     function retImage() {
//         try {
//             return md5(req.files.image.name.split(".")[0]) + req.files.image.name.split(".")[1]
//         }
//         catch (err) {
//             return req.body.oldImage
//         }
//     }
//     await prisma.items.update({
//         data: {
//             title: req.body.title,
//             image: retImage(),
//             description: req.body.description,
//         },
//         where: {
//             id: Number(req.body.id)
//         }
//     })
//     res.redirect("/");
// });

app.post("/deleteItem", async (req: Request, res: Response) => {
    itemsController.delete(req, res);
});

app.post("/addCommentary", async (req: Request, res: Response) => {
    commentariesController.add(req, res);
});

app.post("/deleteCommentary", async (req: Request, res: Response) => {
    commentariesController.delete(req, res);
});