const express = require('express')
const mysql = require('mysql');
const path = require('path')
const md5 = require('md5');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const app = express()

// Соединение с базой данных
const connection = mysql.createConnection({
    host: "127.0.0.1",
    database: "project_database",
    user: "root",
    password: "secret"
});

connection.connect(function (err) { if (err) throw err; });

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'))

// Настройка шаблонизатора
app.set('view engine', 'ejs')

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'))

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }))

// Инициализация сессии
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));

// Загрузка изображений на web-сервер
app.use(fileUpload({}));

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000)

let accountShow = false;

session.auth = false;

function stringData() {
    let date = new Date();
    return String(date.getHours() + ":" + date.getMinutes() + " " + date.getDate() + "." + Number(date.getMonth() + 1) + "." + date.getFullYear());
}

/**
 * Маршруты
 */

//getters

app.get('/', (req, res) => {
    req.session.loyalPass = true;
    connection.query('SELECT * FROM ITEMS', (err, data, firlds) => {
        if (err) throw err;
        res.render('home', {
            items: data,
            auth: req.session.auth,
            username: req.session.username
        })
    })
})

app.get('/item/:id', (req, res) => {
    connection.query("SELECT * FROM items WHERE id=?", [req.params.id],
        (err, data, fields) => {
            if (err) throw err;
            connection.query("SELECT * FROM comment_" + String(data[0].id),
                (err, data2, field) => {
                    if (err) throw err;

                    res.render('item', {
                        item: data[0],
                        comments: data2,
                        auth: req.session.auth,
                        username: req.session.username
                    })
                })
        });
})

app.get('/item/:id/change', (req, res) => {
    connection.query("SELECT * FROM items WHERE id=?", [req.params.id],
        (err, data, fields) => {
            if (err) throw err;
            if (data[0].author != req.session.username) {
                res.redirect('/');
            }
            else {
                res.render("changeItem", {
                    item: data[0],
                    auth: req.session.auth,
                    username: req.session.username
                })
            }
        });
})

app.get('/add', (req, res) => {
    if (req.session.auth != true) {
        res.redirect('/');
    }
    else {
        res.render('add', { auth: req.session.auth, username: req.session.username })
    }

})

app.get('/login', (req, res) => {
    if (req.session.loyalPass == undefined) { req.session.loyalPass = true; }
    res.render('login', { auth: req.session.auth, loyalPass: req.session.loyalPass, username: req.session.username })
})

app.get('/register', (req, res) => {
    if (req.session.errRegist == undefined) { req.session.errRegist = true; }
    res.render('register', { auth: req.session.auth, errRegist: req.session.errRegist, username: req.session.username })
})

//postes

app.post('/register', (req, res) => {
    let redir = '/'
    if (req.body.username == '' || req.body.password == '') {
        req.session.errRegist = "Ни одно поле не может быть пустым";
        redir = '/register';
        res.redirect(redir);
    }
    else {
        connection.query(
            "SELECT * FROM users WHERE username=?",
            [[req.body.username]], (err, data, fields) => {
                if (err) throw err;
                if (data[0] != undefined) {
                    req.session.errRegist = "Имя уже занято";
                    redir = '/register';
                }
                else {
                    connection.query('INSERT INTO users (username, password) VALUES (?, ?) ',
                        [[req.body.username], md5(String([req.body.password]))], (err, data, field) => {
                            if (err) throw err;
                            req.session.auth = true;
                            req.session.errRegist = true;
                            req.session.username = [req.body.username][0];
                        })
                }
                res.redirect(redir);
            });
    }


})

app.post('/logout', (req, res) => {
    req.session.auth = false;
    res.redirect('/');
})

app.post('/login', (req, res) => {
    let redir = '/login';
    connection.query("SELECT * FROM users WHERE username=?",
        [[req.body.username]], (err, data, field) => {
            if (data[0] == undefined) {
                req.session.loyalPass = "Аккаунт не существует";

            }
            else if (md5(String([req.body.password])) == String(data[0].password)) {
                redir = '/';
                req.session.auth = true;
                req.session.username = [req.body.username][0];
                req.session.loyalPass = true;
            }
            else {
                req.session.loyalPass = "Неверный логин или пароль";
            }
            res.redirect(redir);
        })

})


app.post('/add', (req, res) => {
    req.files.image.mv('public/img/' + req.files.image.name);
    connection.query(
        "INSERT INTO items (title, image, description, author, date_creating) VALUES (?, ?, ?, ?, ?)",
        [[req.body.title], req.files.image.name, [req.body.description], req.session.username, stringData()], (err, data, fields) => {
            if (err) throw err;
        });
    connection.query("SELECT * FROM items WHERE title=?", [[req.body.title]], (err, data, field) => {
        connection.query("CREATE TABLE comment_" + String(data[0].id) + "(id int primary key auto_increment, author varchar(255), commentary varchar(255), date varchar(16));",
            (err, data, field) => { if (err) throw err; })
    })


    res.redirect('/')
})

app.post('/update', (req, res) => {
    req.files.image.mv('public/img/' + req.files.image.name);
    connection.query("UPDATE items SET title=?, image=?, description=? WHERE id=?",
        [[req.body.title], req.files.image.name, [req.body.description], Number([req.body.id])], (err, data, fields) => {
            if (err) throw err;

            res.redirect('/')
        })
})

app.post('/delete', (req, res) => {
    connection.query("DELETE FROM items WHERE id=?",
        [Number([req.body.id])], (err, data, fields) => {
            if (err) throw err;
        })
    connection.query("DROP TABLE comment_?",
        [Number([req.body.id])], (err, data, fields) => {
            if (err) throw err;

            res.redirect('/')
        })
})

app.post('/addCommentary', (req, res) => {
    if (req.body.commentary != '') {
        let date = new Date();
        connection.query(
            "INSERT INTO comment_" + String([req.body.id]) + " (author, commentary, date) VALUES (?, ?, ?)",
            [req.session.username, [req.body.commentary], stringData()], (err, data, fields) => {
                if (err) throw err;
            });
    }
    res.redirect('/item/' + String([req.body.id]));
})

app.post('/deleteCommentary', (req, res) => {
    connection.query("DELETE FROM comment_" + String([req.body.id]) + " WHERE id=?",
        [Number([req.body.idComment])], (err, data, fields) => {
            if (err) throw err;
        })
    res.redirect('/items/' + String([req.body.id]));
})