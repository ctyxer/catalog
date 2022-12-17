import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import fileUpload from 'express-fileupload';
import { ItemsController } from './controllers/itemsController';
import { AuthenticationController } from './controllers/authenticationController';
import { CommentsController } from './controllers/commentsController';
import { GlobalController } from './controllers/globalController';
import { CategoriesController } from './controllers/categoriesController';

const app: Express = express();

//Controllers
const itemsController = new ItemsController();
const authenticationController = new AuthenticationController();
const commentsController = new CommentsController();
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
        messageAlert: string
    }
};
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));

// Загрузка изображений на web-сервер
app.use(fileUpload());

/**
 * Маршруты
 */

app.get("/", async (req: Request, res: Response) => {
    globalController.index(req, res);
});

// items
app.get('/items', async (req:  Request, res: Response) => {
    itemsController.index(req, res);
});

app.get("/items/create", async (req: Request, res: Response) => {
    itemsController.create(req, res);
});

app.post("/items/store", async (req: Request, res: Response) => {
    itemsController.store(req, res);
});

app.post("/items/update", async (req: Request, res: Response) => {
    itemsController.update(req, res);
});

app.post("/items/delete", async (req: Request, res: Response) => {
    itemsController.delete(req, res);
});

app.get("/items/:id", async (req: Request, res: Response) => {
    itemsController.show(req, res);
});

app.get("/items/:id/edit", async (req: Request, res: Response) => {
    itemsController.edit(req, res);
});

// categories
app.get('/categories', async (req, res) => {
    categoriesController.index(req, res);
});

app.get("/categories/create", async (req: Request, res: Response) => {
    categoriesController.create(req, res);
});

app.post("/categories/store", async (req: Request, res: Response) => {
    categoriesController.store(req, res);
});

app.post("/categories/delete", async (req: Request, res: Response) => {
    categoriesController.delete(req, res);
});

app.get('/categories/:id', async (req, res) => {
    categoriesController.show(req, res);
});

// auth
app.get("/login", async (req: Request, res: Response) => {
    authenticationController.login(req, res);
});

app.get("/register", async (req: Request, res: Response) => {
    authenticationController.register(req, res);
});

app.post("/auth/logout", async (req: Request, res: Response) => {
    authenticationController.logout(req, res);
});

app.post("/auth/login", async (req: Request, res: Response) => {
    authenticationController.loginUser(req, res);
});

app.post("/auth/register", async (req: Request, res: Response) => {
    authenticationController.registerUser(req, res);
});

//
app.get('/comment/:id/:skip', (req: Request, res: Response) => {
    commentsController.show(req, res);
});

//post
app.post("/comments/store", async (req: Request, res: Response) => {
    commentsController.store(req, res);
});

app.post("/comments/delete", async (req: Request, res: Response) => {
    commentsController.delete(req, res);
});