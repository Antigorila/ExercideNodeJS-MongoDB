const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');
    
const pug = require('pug');


const express = require("express");
const app = express();
const router = express.Router();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public', 'view'));
app.use(express.static(path.join(__dirname ,"/node_modules/bootstrap/dist/css")));
app.use(express.static("./node_modules/bootstrap/dist/js"));
app.use(express.static("./public/js/"));
app.use(express.static("./public/css/"));

const {MongoClient} = require("mongodb");
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const db = require('./public/js/database.js');

global.dbName = "BookShop";

db.setDatabaseConnectionDatas(client, dbName);

async function Main() 
{
    try
    {
        app.get("/", (req, res) => {
            res.render('home');
        });

        app.get("/create_database", (req, res) => {
            db.createDb();
            res.render('home');
        });

        app.get("/fill_database", (req, res) => {
            db.createCollection("users");
            db.createCollection("writers");
            db.createCollection("books");
            db.createCollection("orders");
            db.createCollection("book_orders");
            res.render('home');
        });

        //#region Writers

        app.get("/writers/index", async (req, res) => {
            const writers = await db.listAll("writers");
            res.render('writers/index', { writers: writers });
        });

        app.get("/writers/show/:id", async (req, res) => {
            const writer = await db.findOne("writers", "id", Number.parseInt(req.params.id));
            res.render('writers/show', { writer: writer });
        });
        
        app.get("/writers/create", (req, res) => {
            res.render('writers/create');
        });

        app.post('/writers/add_writer', async (req, res) => {
            let _id = 1;
            let writers = await db.SortBy("writers", "id", "DESC");
            if (writers.length > 0) 
            {
                _id = writers[0].id + 1;
            } 

            const { name, introduction, born_at } = req.body;
            const writer = {
                id: _id,
                name: name,
                introduction: introduction,
                born_at: born_at
            };
            await db.createDoc("writers", writer);
        
            writers = await db.listAll("writers");
            return res.render('writers/index', { writers: writers });
        });

        app.get("/writers/edit/:id", async (req, res) => {
            let writer = await db.findOne("writers", "id", Number.parseInt(req.params.id));
            res.render('writers/edit', { writer: writer });
        });

        app.post('/writers/edit_writer', async (req, res) => {
            const { id, name, introduction, born_at } = req.body;
    
            await db.deleteOne("writers", "id", Number.parseInt(id));
        
            const writer = {
                id: Number.parseInt(id),
                name: name,
                introduction: introduction,
                born_at: born_at
            };
            await db.createDoc("writers", writer);
        
            const writers = await db.listAll("writers");
            return res.render('writers/index', { writers: writers });
        });

        app.get("/writers/delete/:id", async (req, res) => {
            await db.deleteOne("writers", "id", Number.parseInt(req.params.id));

            const writers = await db.listAll("writers");
            res.render('writers/index', { writers: writers });
        });
        
        //#endregion

        //#region Books
        app.get("/books/index", async (req, res) => {
            const books = await db.listAll("books");
            res.render('books/index', { books: books });
        });

        app.get("/books/show/:id", async (req, res) => {
            const book = await db.findOne("books", "id", Number.parseInt(req.params.id));
            res.render('books/show', { book: book });
        });

        app.get("/books/create", async (req, res) => {
            const writers = await db.listAll("writers");
            res.render('books/create', { writers: writers });
        });

        app.post('/books/add', async (req, res) => {
            let _id = 1;
            let books = await db.SortBy("books", "id", "DESC");
            if (books.length > 0) 
            {
                _id = books[0].id + 1;
            } 

            const { title, description, price, release_date, writer_id } = req.body;
            const writer = await db.findOne("writers", "id", Number.parseInt(writer_id));
            
            const book = {
                id: Number.parseInt(_id),
                title: title,
                description: description,
                rating: 0,
                price: price,
                release_date: release_date,
                writer_id: writer
            };
            await db.createDoc("books", book);
            
            //Query again the speciments from the table
            books = await db.listAll("books");
            return res.render('books/index', { books: books });
        });

        app.get("/books/edit/:id", async (req, res) => {
            const book = await db.findOne("books", "id", Number.parseInt(req.params.id));
            const writers = await db.listAll("writers");
            res.render('books/edit', { book: book, writers: writers });
        });

        app.post('/books/update', async (req, res) => {
            const { id, title, description, rating, price, releas_date, writer_id } = req.body;
        
            await db.deleteOne("books", "id", Number.parseInt(id));
            
            const book = {
                id: Number.parseInt(id),
                title: title,
                description: description,
                rating: rating,
                price: price,
                releas_date: releas_date,
                writer_id: await db.findOne("writers", "id", Number.parseInt(writer_id))
            };
            await db.createDoc("books", book);
            
            const books = await db.listAll("books");
            return res.render('books/index', { books: books });
        });

        app.get("/books/delete/:id", async (req, res) => {
            await db.deleteOne("books", "id", Number.parseInt(req.params.id));
    
            const books = await db.listAll("books");
            res.render('books/index', { books: books });
        });

        //#endregion

        ////////////////////////////////////////////////////

        app.get("*", (req, res) => {
            res.send("Page not found");
        });
        
        app.listen(3000, () => {
            console.log("http://localhost:3000/");
        });
    }
    catch (ex)
    {
        console.log("--ERROR--")
        console.log(ex)
        console.log("SERVER DOWN");
    }
}

Main();