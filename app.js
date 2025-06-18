const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
let  methodOverride = require('method-override')
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const listingRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/reviews.js");
const session = require("express-session");
const flash = require('connect-flash');
app.use(express.json());
// const MongoStore = require('connect-mongo');

// router 
// app.use("/listings", listings);
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

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



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: process.env.SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());


// const listings = require("./routes/listing");



app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use( (req , res , next)=> {
  res.locals.successMsg = req.flash("success");
  res.locals.error  =req.flash("error");
  next(); 
})


app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);

//error handler
app.all(/./, (req , res , next)=> {
  next(new ExpressError(404, "Page not found"));
})

//middleware
app.use((err , req ,res , next)=> {
  let {status=500 , message="Something went wrong!"} = err;
  res.status(status).render("listings/error.ejs", {err});
})



app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
