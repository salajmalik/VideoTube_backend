import mongoose, {Schema} from "moongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary URL
            required: true 
        },
        coverImage:{
            type:String, // cloudinary URL
        },
        watchHistory:{
            type: Schema.Types.ObjectId,
            ref:"Video"
        },
        password:{
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps:true
    }
    )

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){  //created new method
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken= function(){
    jwt.sign({
        _id: this._id,
        email: this.email,
        usename: this.username,
        fullName: this.fullName
    },
    process.abort.env.ACCESS_TOKEN_SECRET,
    {
        exoiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken= function(){
    jwt.sign({
        _id: this._id,
       
    },
    process.abort.env.REFRESH_TOKEN_SECRET,
    {
        exoiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User", userSchema)