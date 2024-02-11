import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    //get tweet from body
    //get user details
    //push to tweet database

    const {tweetContent}= req.body;
    if(!tweetContent){
        throw new ApiError(400, "TweetContent is required")
    }

    const userId = req.user._id;

    try{
        const tweet = await Tweet.create({content: tweetContent, owner: userId })

        if(!tweet){
            throw new ApiError(500, "Unable to create tweet")
        }

        return res.status(200).json( new ApiResponse(200, "Tweet created successfully"))
    } catch(err){
        throw new ApiError(500, "unable to create tweet")
    }


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    //get userID
    //check if user ID is valid
    //get all the tweets through aggregation pipeline
    //return the tweets in response

    const{userId} = req.params;

    if(!userId){
        throw new ApiError(400, "enter valid userID")
    }

    try{
        const tweets = Tweet.aggregate([{
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },{
            $group:{
                _id:"$owner",
                tweets:{$push:"$content"}
            }
            
        },{
            $project:{
                _id:0,
                tweets:1
            }
        }])

        const tweetList =  await tweets.exec();

        if(!tweetList || tweetList.length === 0){
            throw new ApiError(400, " You do not have any tweets")
        }

        return res.status(200).json ( new ApiResponse(200, tweetList, "Tweets fetched successfully"))
    } catch(err){
        throw new ApiError(400, "Error occured in fetching tweets")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    //get tweetID
    //get content
    //throw error if content or tweet ID not found
    //check if right person is updating the tweet is compare the IDs
    //find tweetID entry in database and update its content
    //return a response

    const {tweetId} = req.params
    const{tweetContent} = req.body
    if(!tweetId){
        throw new ApiError(404, "tweetID required")
    }

    if(!tweetContent ){
        throw new ApiError(404, "tweetContent required")
    }

    let tweetComponent
    try{
        tweetComponent =  await Tweet.findById(tweetId)
        if(!tweetComponent){
            throw new ApiError(400, "Something went wrong while fetching the tweet from database")
        }

        if(tweetComponent.owner.toString() !==req.user._id.toString()){
            throw new ApiError(400, "you are not authorized to update the tweet")
        }
    }catch(e){
        throw new ApiError(400, "error in finding tweet")
    }


    try {

        //const tweetComponent =  await Tweet.findById(tweetId)
        
        
        
        
        
        const updatedTweet= await Tweet.findByIdAndUpdate(tweetId, {$set: {content: tweetContent}}, {new:true} )
        if(!updatedTweet){
            throw new ApiError(400, "Unable to update tweet")
        }
        
        return res.status(200).json( new ApiResponse(200, updatedTweet, "tweet updated successfully"))
    } catch(err){
        throw new ApiError(400, "Error in updating tweet")
    }
        
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params;
    const userId = req.user?._id
    //const {tweetContent} = req.body;

    if(!tweetId){
        throw new ApiError(400, "Invalid tweet ID")
    }

    if(!userId){
        throw new ApiError(400, "Invalid user ID")
    }

    // if(!tweetContent){
    //     throw new ApiError(400, "tweetContent is required")
    // }

    const existingTweet = await Tweet.findById(tweetId);

    if(!existingTweet){
        throw new ApiError(404, "tweet doesnt exist")
    }

    if(existingTweet.owner.toString() !== userId.toString()){
        throw new ApiError(300, "Unauthorized access")
    }


    try{

        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
        if (!deletedTweet) {
            throw new ApiError(404, "Tweet not found!");
        }

        return res.status(200).json( new ApiResponse(200, deleteTweet, "Tweet deleted successfully"))
    } catch(err){
        throw new ApiError(400, "Unable to delete tweet")
    }

})

export { createTweet, getUserTweets, updateTweet, deleteTweet }