import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import fileUpload from 'express-fileupload';
import { ItemsController } from './controllers/itemsController';
import { AuthenticationController } from './controllers/authenticationController';
import { CommentariesController } from './controllers/commentariesController';
import { GlobalController } from './controllers/globalController';
import { CategoriesController } from './controllers/categoriesController';

const app: Express = express();

//Controllers
const itemsController = new ItemsController();
const authenticationController = new AuthenticationController();
const commentariesController = new CommentariesController();
const categoriesController = new CategoriesController();
const globalController = new GlobalController();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(5000, () => {
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
        username: string,
        role: string
    }
};
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));

// Загрузка изображений на web-сервер
app.use(fileUpload());

/**
 * Маршруты
 */


//getters

app.get("/", async (req: Request, res: Response) => {
    globalController.show(req, res);
});

app.get('/items', async (req:  Request, res: Response) => {
    itemsController.show(req, res);
})

app.get("/items/:id", async (req: Request, res: Response) => {
    itemsController.item(req, res);
});

app.get("/items/:id/change", async (req: Request, res: Response) => {
    itemsController.itemUpdate(req, res);
});

app.get("/addItem", async (req: Request, res: Response) => {
    itemsController.addGet(req, res);
});

app.get('/categories', async (req, res) => {
    categoriesController.show(req, res);
});

app.get('/categories/:id', async (req, res) => {
    categoriesController.item(req, res);
});

app.get("/addCategory", async (req: Request, res: Response) => {
    categoriesController.addGet(req, res);
});

app.post("/addCategory", async (req: Request, res: Response) => {
    categoriesController.addPost(req, res);
});

app.get("/login", async (req: Request, res: Response) => {
    authenticationController.login(req, res);
});

app.get("/register", async (req: Request, res: Response) => {
    authenticationController.register(req, res);
});

app.get('/comment/:id/:skip', (req: Request, res: Response) => {
    commentariesController.show(req, res);
});

//postes

app.post("/logining", async (req: Request, res: Response) => {
    authenticationController.logining(req, res);
});

app.post("/logout", async (req: Request, res: Response) => {
    authenticationController.logout(req, res);
});

app.post("/registering", async (req: Request, res: Response) => {
    authenticationController.registering(req, res);
});

app.post("/add", async (req: Request, res: Response) => {
    itemsController.addPost(req, res);
});

app.post("/update", async (req: Request, res: Response) => {
    itemsController.update(req, res);
});

app.post("/deleteItem", async (req: Request, res: Response) => {
    itemsController.delete(req, res);
});

app.post("/addCommentary", async (req: Request, res: Response) => {
    commentariesController.add(req, res);
});

app.post("/deleteCommentary", async (req: Request, res: Response) => {
    commentariesController.delete(req, res);
});