import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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

    const existedUser = User.findOne( { $or: [{username}, {email}] } ) //$or is or operator, User is directly connected to database through mongoose

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;  //files access is given by middleware, ? means if files not present then skip, do not give any error

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create( 
        { fullname, 
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

export {registerUser}