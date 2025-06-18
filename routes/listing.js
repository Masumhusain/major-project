const express  = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
// const { wrap } = require("module");



//Validation listing Schema
let ValidationSchema = (req , res , next)=> {
  let {error} = listingSchema.validate(req.body);
  if(error) {
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400 , errMsg);
  }else {
    next();
  }
}

//Index route
router.get("/", wrapAsync(async(req ,res)=> {
let  allListing = await Listing.find({});
res.render("listings/index.ejs", {allListing});
}));



//new route
router.get("/new", (req ,res)=> {
  res.render("listings/new.ejs");
});


 // create route
 router.post("/",ValidationSchema, wrapAsync(async(req ,res , next)=> {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success" , "new listings created successfully!");
  res.redirect("/listings");
 }))


 //edit route
 router.get("/:id/edit", wrapAsync(async(req , res)=> {
  let {id} = req.params;
  const listing = await Listing.findById(id);
   if(!listing) {
    req.flash("error" , "listing your requested for does not exist");
   return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", {listing});
 }));

 //update route
 router.put("/:id", ValidationSchema , wrapAsync(async(req , res)=> {
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id , {...req.body.listing});
  req.flash("success" , "listing updated!");
  res.redirect(`/listings/${id}`);
 }));

 //delete route
 router.delete("/:id", wrapAsync(async(req, res)=> {
  let {id} = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", "listing deleted successfully!");
  res.redirect("/listings");
 }))

 //show route
router.get("/:id", wrapAsync(async( req ,res)=> {
  let {id} = req.params;
  const listing  = await Listing.findById(id).populate("reviews");
  if(!listing) {
    req.flash("error" , "listing your requested for does not exist");
   return res.redirect("/listings");
  }
  res.render("listings/show.ejs", {listing});
}));



module.exports = router;