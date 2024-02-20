import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400, "Please enter videoId")
    }

    try{
        const videoInstance = Video.findOne(videoId)

        if(!videoInstance){
            throw new ApiError(400, "Video not found")
        }

        return res.status(200).json(200, videoInstance, "Video fetched")

    }catch(e){
        throw new ApiError(400,"There was some error while fetching the video")
    }
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(400, "Please enter videoId")
    }

    try{
        const videoInstance = Video.delete(videoId)

        if(!videoInstance){
            throw new ApiError(400, "Video not found")
        }

        return res.status(200).json(200, videoInstance, "Video deleted")

    }catch(e){
        throw new ApiError(400,"There was some error while deleting the video")
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}