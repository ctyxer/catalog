import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import fileUpload from 'express-fileupload';
import { ItemsController } from './src/controllers/ItemsController';
import { UserController } from './src/controllers/UserController';
import { CommentsController } from './src/controllers/CommentsController';
import { GlobalController } from './src/controllers/GlobalController';
import { CategoriesController } from './src/controllers/CategoriesController';

const app: Express = express();

//Controllers
const itemsController = new ItemsController();
const userController = new UserController();
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

app.get('/find', async (req: Request, res: Response) => {
    globalController.find(req, res);
});

app.get('/user/:username', async (req: Request, res: Response) => {
    globalController.userPage(req, res);
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

app.post("/items/find", async (req: Request, res: Response) => {
    itemsController.search(req, res);
});

app.get("/items/sort/alfabet", async (req: Request, res: Response) => {
    itemsController.sortAlfabet(req, res);
});

app.get("/items/sort/date", async (req: Request, res: Response) => {
    itemsController.sortDate(req, res);
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
    userController.login(req, res);
});

app.get("/register", async (req: Request, res: Response) => {
    userController.register(req, res);
});

app.post("/auth/logout", async (req: Request, res: Response) => {
    userController.logout(req, res);
});

app.post("/auth/login", async (req: Request, res: Response) => {
    userController.loginUser(req, res);
});

app.post("/auth/register", async (req: Request, res: Response) => {
    userController.registerUser(req, res);
});

//user
app.get('/users/:username', async (req: Request, res: Response) => {
    userController.show(req, res);
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