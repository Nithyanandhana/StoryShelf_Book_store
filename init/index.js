const mongoose = require("mongoose");
const initData = require("./data.js");
const Book = require("../models/book.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/storyshelf";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Book.deleteMany({});
  await Book.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();