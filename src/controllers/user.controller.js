import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Jwt  from "jsonwebtoken"


const generateAccessAndRefreshtockens = async (userId)=>{
    // try {
    //     const user = await User.findById(userId)
    //     const accessToken = user.generateAccessToken()
    //     const refreshToken = user.generateRefreshToken()

    //     user.refreshToken = refreshToken
    //     await user.save({ validateBeforeSave: false })

    //     return {accessToken, refreshToken}


    // } catch (error) {
    //     throw new ApiError(500, "Something went wrong while generating referesh and access token")
    // }
    const user = await User.findById(userId)
    let accessToken
    let refreshToken
    try{
        
         accessToken = user.generateAccessToken()
         refreshToken = user.generateRefreshToken()
    }catch(error){
        throw new ApiError(500, "block 1")
    }

    try{
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "block 2")
    }
}

const registerUser = asyncHandler( async (req,res) =>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, check avatar
    // create user object - create entry in db
    // remove password and refresh oekn filed from response
    // check for user creation, if yes return res, if no send error

    const {fullName, email, username, password} = req.body  //destructuring
    console.log("email: ", email);

    if([fullName, email, username, password].some((field) => field?.trim() === "")){  //checking if any field in empty
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne( { $or: [{username}, {email}] } ) //$or is or operator, User is directly connected to database through mongoose

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;  //files access is given by middleware, ? means if files not present then skip, do not give any error

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create( 
        { fullName, 
        avatar: avatar.url, 
        coverImage: coverImage?.url || "", 
        email, 
        password, 
        username: username.toLowerCase() } 
    )// email means key and value both will be email

    const createdUser = await User.findById(user._id).select("-password -refreshToken") //fields entered inside selected will not be selected

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json( new ApiResponse(200, createdUser, "User registered successfully"))

})

const loginUser = asyncHandler( async (req,res) =>{
    //bring data from req body
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie 

    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({ $or: [{username}, {email}] }) //return either username or email whichever is present

    if(!user){
        throw new ApiError( 404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshtockens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = { httpOnly: true, secure: true }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json( new ApiResponse ( 200, { user: loggedInUser, accessToken, refreshToken }, "User logged In Successfully" ) )

})

const logoutUser = asyncHandler (async(req, res)=>{
    await User.findByIdAndUpdate( req.user._id, { $set: {refreshToken: undefined} },{ new: true} )
    
    const options = { httpOnly: true, secure: true }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler ( async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = Jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incominRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshtockens(user._id)
    
        return res.status(200) .cookie( "accessToken", accessToken, options ) .cookie( "refreshToken",newRefreshToken, options )
        .json( new ApiResponse( 200, {accessToken, refreshToken: newRefreshToken}, "Access Token refreshed" ) )
    } catch (error) {
        throw new ApiError(401, error?.message ||"Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await UserfindById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid olld password")
    }
    user.password= newPassword
    user.save({validateBeforeSave: false})

    return res.satus(200).json(new ApiResponse(200, {}, "Password Changes successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate( req.user?._id, { $set: {fullName, email:email}}, {new: true} ). select("-password")

    return res.status(200).json( new ApiResponse(200, user, "Accound details updates successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage}