import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400, "Video ID not found")
    }

    let userId=req.user._id

    let videoLike = await Like.create({
        video:videoId, tweet: null, comment: null, likedBy: userId
    })

    if(!videoLike){
        throw new ApiError(500, "Unable to like the video")
    }

    return res.status(200).json(200, videoLike, "Liked the video")
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400, "comment ID not found")
    }

    let userId=req.user._id

    let commentLike = await Like.create({
        video:null, tweet: null, comment: commentId, likedBy: userId
    })

    if(!commentLike){
        throw new ApiError(500, "Unable to like the comment")
    }

    return res.status(200).json(200, commentLike, "Liked the comment")
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(400, "Tweet ID not found")
    }

    let userId=req.user._id

    let tweetLike = await Like.create({
        video:null, tweet: tweetId, comment: null, likedBy: userId
    })

    if(!tweetLike){
        throw new ApiError(500, "Unable to like the tweet")
    }

    return res.status(200).json(200, tweetLike, "Liked the tweet")
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}