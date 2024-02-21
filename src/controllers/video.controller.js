import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


function checkOwner(userId, changerId){
    if(userId!=changerId){
        return false 
    } else{
        return true
    }
}
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title) {
        throw new ApiError(400, "Please add title")
    }
    if(!description){
        throw new ApiError(400, "Please add description")
    }

    let videoFilePath = req.files?.videoFile[0]?.path 
    if(!videoFilePath){
        throw new ApiError(400, "Something went wrong while fetching the video path")
    }

    let thumbnailPath = req.files?.thumbnail[0]?.path
    if(!thumbnailPath){
        throw new ApiError(400, "Something went wrong while fetching the thumbnail path")
    }

    let video = await uploadOnCloudinary(videoFilePath)
    let thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!video||!thumbnail){
        throw new ApiError(400, "Unable to upload video or thumbnail on cloudinary")
    }

    try{
        let newVideo = await Video.create (
            {  videoFile: video?.url,
            thumbnail: thumbnail?.url,
            title,
            description,
            duration: video?.duration,
            views:0,
            isPublished: true,
            owner:req.user?._id
            }
        )

        return res.status(200).json(new ApiResponse(200,newVideo, "Video public=shed Successfully"))
    } catch(err){
        throw new ApiError(400, "Something went wrong while publishing the video")
    }
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
    if(!videoId){
        throw new ApiError(400, "please enter videoID")
    }

    let video = await Video.findById(videoId)

    let isOwner = checkOwner(req.usr._id, video.owner)

    if(!isOwner){
        throw new ApiError(400, "You are not authorized to update this video")
    }

    const {title,description} = req.body;
    if(!title || !description){
        throw new ApiError(404,"Title or Description is required!!!")
    }

    let thumbnailPath = req.file?.path
    let thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!thumbnail){
        throw new ApiError(500, "something went wrong while uploading thumbnail on cloudinary")
    }

    let updatedVideo = await Video.findByIdAndUpdate(videoId,{ $set:{title:title, description:description, thumbnail:thumbnail.url}}, {new:true})

    if(!updatedVideo){
        throw new ApiError(500, "something went wrong while updating the thumbnail")
    }

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Thumbnail updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(400, "Please enter videoId")
    }
    let video= Video.findById(videoId)

    let isOwner = checkOwner(req.user._id, video.owner)

    if(!isOwner){
        throw new ApiError(400, "Not authorised to delete the video")
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
    if(!videoId){
        throw new ApiError(200, "Enter videoId")
    }

    let video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(200, "Enter valid videoId")
    }
    let published = video.isPublished
    
    let isOwner = checkOwner(req.user._id, video.owner)

    if(!isOwner){
        throw new ApiError(200, "Not authorised to cahnge the publish status")
    }

    let video1 = await Video.findByIdAndUpdate(videoId,{$set:{isPublished: !published}} , {new:true})

    if(! video1){
        throw new ApiError(200, "Something went wrong while toggling publish status")
    }

    return res.status(200).json(new ApiResponse(200, video1, "Publish status toggled successfully"))
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}