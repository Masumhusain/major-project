const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: {
            type: String,
            default: "https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg",
            set: (v) =>{
                    if( !v ||v.trim() === "") {
                        return  "https://cdn.pixabay.com/photo/2024/05/26/10/15/bird-8788491_1280.jpg";
                     }
                     return v;
        }
    },
        filename: {
            type: String,
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});


listingSchema.post("findOneAndDelete", async(listing)=> {
    if(listing) {
            await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})


const Listing = mongoose.model("Listing" , listingSchema );
module.exports = Listing;