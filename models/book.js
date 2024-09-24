const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://gridgum.com/images/content/book-store.jpg",
    set: (v) =>
      v === ""
        ? "https://gridgum.com/images/content/book-store.jpg"
        : v,
  },
  price: Number,
  author: String,
  genre: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;