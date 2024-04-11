import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId){
        throw new ApiError(400,"videoId is required!!");
    }
    const video = await Video.findById(videoId);
    if(!video){
         // If the video doesn't exist, delete all comments associated with the video ID
         await Comment.deleteMany({ video: videoId });
         throw new ApiError(400, "There is no such Video. All associated comments have been deleted.");
    }
    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes",
                },
                owner: {
                    $first: "$owner",
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                },
                isLiked: 1
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };
    const comments = await Comment.aggregatePaginate(
        commentsAggregate,
        options
    );

    if(!comments || comments.length === 0){
        return res.status(200).json(new ApiResponse(200,{},"No commments in this video!!"))
    }

    return res.status(200).json(new ApiResponse(200,comments,"Comments of the video fetched Successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    let {commentContent} = req.body
    let{videoId} = req.params
    let owner = req.user._id

    if(!commentContent){
        throw new ApiError(400, "Comment cannot be empty")
    }

    if(!videoId){
        throw new ApiError(400, "please provide video ID")
    }

    let newComment = await  Comment.create({
        content: commentContent,
        video: videoId,
        owner: owner
    })

    if(!newComment){
        throw new ApiError(400, "Unable to create new comment")
    }

    return res.status(200).json(new ApiResponse(200, newComment, "New comment created"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    let{commentContent} = req.body
    if(!commentContent){
        throw new ApiError(400, "comment content can not be empty")
    }

    let {commentId}= req.params
    if(!commentId){
        throw new ApiError(400, "Please provide comment ID")
    }

    let comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400, "Comment not found")
    }

    if(comment.owner.toString()!=req.user._id){
        throw new ApiError(400, " Not authorized to update comment content")
    }

    let updatedComment = await Comment.findByIdAndUpdate(commentId, {$set:{content:commentContent}}, {new:true})

    if(!updatedComment){
        throw new ApiError(500, "Unable to update comment")
    }

    return res.status(200).json(new ApiResponse(200, updateComment, "Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    let {commentId}= req.params
    if(!commentId){
        throw new ApiError(400, "Comment ID is requires")
    }

    let userId = req.body._id

    let comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400, "Comment not found")
    }

    if(comment.owner.toString()!= userId){
        throw new ApiError(400, "You are not authorised to delete this comment")
    }

    let deletedComment = Comment.findByIdAndDelete(commentId)
    if(!deletedComment){
        throw new ApiError(400, "Unable to delete comment")
    }

    return res.status(200).json(new ApiResponse(200, deletedComment, "comment deleted successfully"))
})

export { getVideoComments, addComment, updateComment, deleteComment }