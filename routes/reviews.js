const express  = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

//validation review schema
let validationReviewSchema = (req , res , next)=> {
  let {error} = reviewSchema.validate(req.body);
  if(error) {
    let errorMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400 , errorMsg);
  }else {
    next();
  }
}



// review 
//review schema
router.post("/",validationReviewSchema, wrapAsync(async(req , res)=> {
  let listing = await Listing.findById(req.params.id);
  // console.log(req.params.id);
  if(!listing) {
    throw new ExpressError(404, 'Listing not found');
  }
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
   req.flash("success" , "review created!");
  res.redirect(`/listings/${listing._id}`);
}));


//handline deletion in review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // Review ko delete karo
    await Review.findByIdAndDelete(reviewId);
    // Listing ke reviews array se review ka id hatao
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
     req.flash("success" , "review deleted!");
    res.redirect(`/listings/${id}`);
}));



module.exports = router;