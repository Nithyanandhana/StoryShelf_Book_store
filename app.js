const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Book = require("./models/book.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
require('dotenv').config();
const dbUrl = process.env.ATLASDB_URL;
//const MONGO_URL = "mongodb://localhost:27017/storyshelf";

const session = require('express-session');
const MongoStore = require('connect-mongo');
main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    })


async function main() {
    await mongoose.connect(MONGO_URL);
}
async function main() {
    await mongoose.connect(dbUrl);
}
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 *  60 * 60, // 1 day

});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,

    },
};

store.on("error", () => {
    console.log("Error in mongo session");
})


const objectId = new mongoose.Types.ObjectId();
const objectIdString = objectId.toString();  // Converts ObjectId to a string


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use('/styles.css', express.static(__dirname + '/styles.css'));

// app.get("/",(req,res) =>{
//     res.send("hi i am root");
// })
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/books",async(req,res) => {
    const allBooks = await Book.find({});
    res.render("books/index.ejs",{ allBooks});
});


//new route
app.get("/books/new",(req,res) => {
    res.render("books/new.ejs");
});


// show route
app.get("/books/:id",async(req,res) => {
    let { id } = req.params;
    const book = await Book.findById(id).populate("reviews");
    res.render("books/show.ejs",{book});

});


//create route
app.post("/books",async(req,res,next) => {
try{
    const newBook = new Book(req.body.book);
    await  newBook.save();
    res.redirect("/books");
}catch(err){
    next(err);
}
});


//edit route
// app.get("/books/:id/edit",async(req,res) => {
//     let { id } = req.params;
//     const book = await Book.findById(id);
//     res.render("books/edit.ejs",{book});
// });


//update route
// app.put("/books/:id", async (req, res) => {
//     let { id } = req.params;
//     console.log(`Updating book with id ${id}`);
//     console.log(`req.body.book:`, req.body.book);
//     try {
//       const book = await Book.findByIdAndUpdate(id, { ...req.body.book });
//       console.log(`Book updated:`, book);
//       res.redirect(`books/${id}`);
//     } catch (err) {
//       console.error(`Error updating book:`, err);
//       res.status(500).send(`Error updating book: ${err.message}`);
//     }
//   });


// delete route
// app.delete("/books/:id",async(req,res) => {
//     let { id } = req.params;
//     let deletedBook = await Book.findByIdAndDelete(id);
//     console.log(deletedBook);
//     res.redirect("/books");
// });


// reviews
// post route
app.post("/books/:id/reviews",async (req,res)=> {
    let book = await Book.findById(req.params.id);
    let newReview = new Review(req.body.review);

    book.reviews.push(newReview);
    await newReview.save();
    await book.save();

    res.redirect(`/books/${book._id}`);
})


app.use((err,req,res,next) => {
    res.send("Something went wrong!");
});

app.all("*",(req,res,next) => {
    next(new ExpressError(404,"Page not Found"));
});
app.use((err,req,res,next) => {
    let { statusCode = 500 , message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{ message });
});
app.listen(8080,() => {
    console.log("server is listening");
})