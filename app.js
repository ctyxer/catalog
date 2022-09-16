const express = require("express");
const mysql = require("mysql");
const path = require("path");
const md5 = require("md5");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();

// Соединение с базой данных
require('dotenv').config();
const connection = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
    });

connection.connect(function (err) {
    if (err) throw err;
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
app.use(fileUpload({}));

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000);

let accountShow = false;

session.auth = false;

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

function sortAlfabet(req, mass) {
    mass.sort(function (a, b) {
        return a.title - b.title;
    })
    if (req.session.sortType < 0) { mass = mass.reverse() }
    return mass;
}

function sortDate(req, mass) {
    mass.sort(function (a, b) {
        return Number(new Date(a.date_creating).getTime()) - Number(new Date(b.date_creating).getTime());
    })
    if (req.session.sortType < 0) { mass.reverse() }
    return mass;
}

function sortPrice(req, mass) {
    mass.sort(function (a, b) {
        return Number(a.price) - Number(b.price);
    })
    if (req.session.sortType < 0) { mass.reverse() }
    return mass;
}

/**
 * Маршруты
 */

//getters

app.get("/", (req, res) => {
    req.session.loyalPass = true;
    connection.query("SELECT * FROM items", (err, data, firlds) => {
        if (err) throw err;
        data = data.map(function (a) {
            return { ...a, date_creating: stringData(a.date_creating) };
        })
        switch (Math.abs(req.session.sortType)) {
            case 1:
                data = sortAlfabet(req, data);
            case 2:
                data = sortDate(req, data);
            case 3:
                data = sortPrice(req, data);
        }
        res.render("home",
            {
                items: data,
                auth: req.session.auth,
                username: req.session.username,
            });
    });
});

app.get("/items/:id", (req, res) => {
    connection.query(
        "SELECT * FROM items WHERE id=?",
        [req.params.id],
        (err, data, fields) => {
            if (err) throw err;

            connection.query(
                "SELECT * FROM comments WHERE item_id=" + String(data[0].id),
                (err, data2, field) => {
                    if (err) throw err;
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
                            auth: req.session.auth,
                            username: req.session.username,
                        });
                }
            );
        }
    );
});

app.get("/items/:id/change", (req, res) => {
    connection.query(
        "SELECT * FROM items WHERE id=?",
        [req.params.id],
        (err, data, fields) => {
            if (err) throw err;
            if (data[0].author != req.session.username) {
                res.redirect("/");
            } else {
                res.render("changeItem",
                    {
                        item: data[0],
                        auth: req.session.auth,
                        username: req.session.username,
                    });
            }
        }
    );
});

app.get("/add", (req, res) => {
    if (req.session.auth != true) {
        res.redirect("/");
    } else {
        res.render("add",
            {
                auth: req.session.auth,
                username: req.session.username,
            });
    }
});

app.get("/login", (req, res) => {
    if (req.session.loyalPass == undefined) {
        req.session.loyalPass = true;
    }
    res.render("login",
        {
            auth: req.session.auth,
            loyalPass: req.session.loyalPass,
            username: req.session.username,
        });
});

app.get("/register", (req, res) => {
    if (req.session.errRegist == undefined) {
        req.session.errRegist = true;
    }
    res.render("register",
        {
            auth: req.session.auth,
            errRegist: req.session.errRegist,
            username: req.session.username,
        });
});

//postes

app.post("/login", (req, res) => {
    let redir = "/login";
    connection.query(
        "SELECT * FROM users WHERE username=?",
        [[req.body.username]],
        (err, data, field) => {
            if (data[0] == undefined) {
                req.session.loyalPass = "Аккаунт не существует";
            } else if (md5(String([req.body.password])) == String(data[0].password)) {
                redir = "/";
                req.session.auth = true;
                req.session.username = [req.body.username][0];
                req.session.loyalPass = true;
            } else {
                req.session.loyalPass = "Неверный логин или пароль";
            }
            res.redirect(redir);
        }
    );
});

app.post("/logout", (req, res) => {
    req.session.auth = false;
    req.session.username = undefined;
    res.redirect("/");
});

app.post("/register", (req, res) => {
    let redir = "/register";
    if (req.body.username == "" || req.body.password == "") {
        req.session.errRegist = "Ни одно поле не может быть пустым";
        res.redirect(redir);
    } else {
        connection.query(
            "SELECT * FROM users WHERE username=?",
            [[req.body.username]],
            (err, data, fields) => {
                if (err) throw err;
                if (data[0] != undefined) {
                    req.session.errRegist = "Имя уже занято";
                    res.redirect(redir);
                } else {
                    connection.query(
                        "INSERT INTO users (username, password, role) VALUES (?, ?, 'User')",
                        [[req.body.username], md5(String([req.body.password]))],
                        (err, data, field) => {
                            if (err) throw err;

                            redir = "/";
                            req.session.auth = true;
                            req.session.errRegist = true;
                            req.session.username = [req.body.username][0];
                            res.redirect(redir);
                        }
                    );
                }

            }
        );
    }
});

app.post("/add", (req, res) => {
    req.files.image.mv("./public/img/" + req.files.image.name);
    let newName = "/public/img/" + md5(req.files.image.name.split(".")[0]) + ".wepb";
    fs.rename("./public/img/" + req.files.image.name, newName, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
    connection.query(
        "INSERT INTO items (title, image, description, price, author, date_creating) VALUES (?, ?, ?, ?, ?, ?)",
        [
            [req.body.title],
            newName,
            [req.body.description],
            [Number(req.body.price)],
            req.session.username,
            new Date(),
        ],
        (err, data, fields) => {
            if (err) throw err;
        }
    );
    res.redirect("/");
});

app.post("/update", (req, res) => {
    try {
        fs.unlinkSync("./public/img/" + req.body.oldImage);
    }
    catch (err) { }
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
            return md5(req.files.image.name.split(".")[0]) + ".wepb"
        }
        catch (err) {
            return req.body.oldImage
        }
    }
    connection.query(
        "UPDATE items SET title=?, image=?, description=?, price=? WHERE id=?",
        [
            [req.body.title],
            retImage(),
            [req.body.description],
            [Number(req.body.price)],
            Number([req.body.id]),
        ],
        (err, data, fields) => {
            if (err) throw err;

            res.redirect("/");
        }
    );
});

app.post("/delete", (req, res) => {
    try {
        fs.unlinkSync("./public/img/" + req.body.oldImage);
    }
    catch (err) { }
    connection.query(
        "DELETE FROM items WHERE id=?",
        [Number([req.body.id])],
        (err, data, fields) => {
            if (err) throw err;
        }
    );
    connection.query(
        "DELETE FROM comments WHERE item_id=?",
        [Number([req.body.id])],
        (err, data, fields) => {
            if (err) throw err;

            res.redirect("/");
        }
    );
});

app.post("/addCommentary", (req, res) => {
    if (req.body.commentary != "") {
        let date = new Date();
        connection.query(
            "INSERT INTO comments(author, commentary, date_creating, item_id) VALUES (?, ?, ?, ?)",
            [req.session.username, [req.body.commentary], new Date(), String([req.body.id])],
            (err, data, fields) => {
                if (err) throw err;
            }
        );
    }
    res.redirect("/items/" + String([req.body.id]));
});

app.post("/deleteCommentary", (req, res) => {
    connection.query(
        "DELETE FROM comments WHERE id=?",
        [Number([req.body.id])],
        (err, data, fields) => {
            if (err) throw err;
        }
    );
    res.redirect("/items/" + String([req.body.id]));
});

app.post("/usingSortAlfabet", (req, res) => {
    if (req.session.sortType == 1) { req.session.sortType = -1 }
    else { req.session.sortType = 1 }
    res.redirect("/");
});

app.post("/usingSortDate", (req, res) => {
    if (req.session.sortType == 2) { req.session.sortType = -2 }
    else { req.session.sortType = 2 }
    res.redirect("/");
});

app.post("/usingSortPrice", (req, res) => {
    if (req.session.sortType == 3) { req.session.sortType = -3 }
    else { req.session.sortType = 3 }
    res.redirect("/");
});
