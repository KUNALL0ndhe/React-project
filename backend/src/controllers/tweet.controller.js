import mongoose from "mongoose";
import Tweet from "../models/tweet.model";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

   try {
     const {  content, owner } = req.body;
 
     if ( !content ) 
     {
         throw new ApiError(402, "Content is Required")
     };
     
     // Create Tweet for the tweet page

     const tweet = await Tweet.create( { content, owner } )

     //Send the response

     return res
     .status(201)
     .json(
        new ApiResponse(201, tweet, "Tweet is created. ")
     )
   } catch (error) {

    throw new ApiError(400, error.message || "Invalid Request to Create")
   }

    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    try {
        const { userId } = req.params


        if (!userId) {
            throw new ApiError(402, "user Id required")
        }

        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid User Id")
        }

        const tweetedUser = await Tweet.aggregate([
            
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId) //match By Owner
                    }
                },
                {
                    $lookup: {
                        from : "users", // The name of the collection in mongodb
                        localField: "owner", // Field in the Tweet Schema
                        foreignField: "_id", // Field in the User Schema
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                }
            
        ]);

        if (!tweetedUser.length) {
            throw new ApiError(404, "Tweet Does not Exists")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweetedUser,
                "Tweet Fetched For User. "
            )
        )




    }  catch (error) {
        console.error("Error in getUserTweets:", error);
        throw new ApiError(401, "Error in fetching the tweets for this user");
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}