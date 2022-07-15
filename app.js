const express = require('express')
const mysql = require('mysql');
const path = require('path')
const session = require('express-session');
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
app.use(session({secret: "Secret", resave: false, saveUninitialized: true}));

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000)

/**
 * Маршруты
 */

// Middleware
function isAuth(req, res, next) {
    if (session.auth) {
      next();
    } else {
      res.redirect('/');
    }
  }

function hashingStr(string) {
    var hash = 5;
    string = String(string);
    if (string.length == 5) return hash;
    for (a = 5; a <string.length; a++) {
    ch = string.charCodeAt(a);
            hash = ((hash <<5) - hash) + ch;
            hash = hash & hash;
        }
    return hash;
}

app.get('/', (req, res) => {
    connection.query('SELECT * FROM ITEMS', (err, data, firlds) => {
        if(err) throw err;
        res.render('home', {
            items: data,
            auth: session.auth
        })
    })
})

app.get('/items/:id', (req, res) => {
    connection.query("SELECT * FROM items WHERE id=?", [req.params.id],
    (err, data, fields) => {
        if (err) throw err;
        connection.query("SELECT * FROM comment_"+String(data[0].id),
        (err, data2, field) => {
            if (err) throw err;
            
            res.render('item', {
                item: data[0],
                comments: data2,
                auth: session.auth
            })
        })        
    });
})

app.get('/add', (req, res) => {
    res.render('add', {auth: req.session.auth})   
})

app.get('/login', (req,res) => {
    res.render('login', {auth: session.auth, loyalPass: session.loyalPass}) 
})

app.get('/register', (req,res) => {
    res.render('register', {auth: session.auth, freeUsername: session.freeUsername}) 
})

app.post('/register', (req, res) =>{
    let redir = '/'
    connection.query(
        "SELECT * FROM users WHERE username=?",
        [[req.body.username]], (err, data, fields) => {
            if (err) throw err;
            if(data[0] != undefined)
            {
                session.freeUsername = false;
                redir = '/register';
            }
            else
            {
                connection.query('INSERT INTO users (username, password) VALUES (?, ?) ', 
                [[req.body.username], hashingStr(String([req.body.password]))], (err, data, field) => {
                    if(err) throw err;
                    session.auth = true;
                    session.freeUsername = true;
                    session.username = [req.body.username][0];
                })
            }
        });
    res.redirect(redir);    
})

app.post('/logout', (req,res)=> {
    session.auth = false;
    res.redirect('/');
})

app.post('/login', (req,res)=> {
    let redir = '/login';
    connection.query("SELECT * FROM users WHERE username=?", 
    [[req.body.username]], (err, data, field) => {
        if(hashingStr(String([req.body.password])) == String(data[0].password))
        {
            redir = '/';
            session.auth = true;
            session.username = [req.body.username][0];
        }
        else
        {
            session.loyalPass = false;
        }
        res.redirect(redir);
    })
})


app.post('/store', (req, res) => {
    connection.query(
      "INSERT INTO items (title, image, description) VALUES (?, ?, ?)",
      [[req.body.title], [req.body.image], [req.body.description]], (err, data, fields) => {
        if (err) throw err;
    });
    connection.query("SELECT * FROM items WHERE title=?", [[req.body.title]], (err, data, field) => {
        connection.query("CREATE TABLE comment_"+String(data[0].id)+"(id int primary key auto_increment, author varchar(255), commentary varchar(255));", 
        (err, data, field) =>{ if (err) throw err; })
    })
    
  
    res.redirect('/')
  })

app.post('/update', (req, res) =>{
    connection.query("UPDATE items SET title=?, image=?, description=? WHERE id=?",
    [[req.body.title], [req.body.image], [req.body.description], Number([req.body.id])], (err,data,fields) => {
        if (err) throw err;
  
        res.redirect('/')
    })
})

app.post('/delete', (req, res) =>{
    connection.query("DELETE FROM items WHERE id=?",
    [Number([req.body.id])], (err,data,fields) => {
        if (err) throw err;
  
        res.redirect('/')
    })
    connection.query("DELETE FROM comment_?",
    [Number([req.body.id])], (err,data,fields) => {
        if (err) throw err;
  
        res.redirect('/')
    })
})

app.post('/addCommentary', (req, res) => {
    connection.query(
        "INSERT INTO comment_"+String([req.body.id])+" (author, commentary) VALUES (?, ?)",
        [session.username, [req.body.commentary]], (err, data, fields) => {
          if (err) throw err;
      });
    res.redirect('/')
})