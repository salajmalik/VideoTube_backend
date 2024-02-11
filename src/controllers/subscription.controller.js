import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._Id;

    if(!channelId){
        throw new ApiError(400, "Enter valid channelId")
    }

    try{
        const credential = {subscriber: userId, channel: channelId}
        const subscribed = await Subscription.findOne(credential);

        if(!subscribed){
            const newSubscription = await Subscription.create(credential)
            if(!newSubscription){
                throw new ApiError(400, "Unable to subscribe")
            }
            return res.status(200).json( ApiResponse(200, newSubscription, "subscribed successfully"))

        }
            else{
                const delSubscription = await Subscription.delete(credential)

                if(!delSubscription){
                    throw new ApiError(400, "Unable to unsubscribe")
                }
                return res.status(200).json(ApiResponse(200, delSubscription, "unsuscribed successfully"))
            }

        

    }catch(e){
        throw new ApiError(400,"Not able to perform toggle subscription operation")
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    //get channelId
    //If channelId not there then return error
    //Perform aggregation on database to get array of all the subscribers

    if(!channelId){
        throw new ApiError(400,"Enter channelId")
    }

    try{
        const subscriberList = await Subscription.aggregate([{
            $match:{
                channel : new mongoose.Types.ObjectId(channelId)
            },
        },{
            $group:{
                _id:"$channel",
                subscribers:{$push:"$subscriber"}
            }
        },{
            $project:{
                _id:0,
                subscribers:1
            }
        }])

        if(!subscriberList || subscriberList.length === 0){
            return res.status(200).json(new ApiResponse(200, [], "No subscribers found for the channel"));
        }

        return res.status(200).json( new ApiResponse(200, subscriberList, "Subscriber list fetched successsfully"))

    } catch(e){
        throw new ApiError(400, "Not able to fetch subscribers")
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    //check ifsubscriberId is present
    //rerieve all the subscriptions from the database using aggregation function
    

    if(!subscriberId){
        throw new ApiError(400, "SubscriberId required")
    }

    try{
        const subscriptions = await Subscription.aggregate([{
            $match:{
                channel : new mongoose.Types.ObjectId(subscriberId)
            },},{
                $group:{
                    _id:"$channel",
                    subscribers:{$push:"$subscriber"}
                }
            },{
                $project:{
                    _id:0,
                    subscribers:1
                }
        }])

        if(!subscriptions || subscriptions.length === 0){ 
            return res.status(200).json(new ApiResponse(200, [], "No subscriptions for the user"));
        }

        return res.status(200).json( new ApiResponse(200, subscriptions, "Subscription list fetched successsfully"))

    } catch(e){
        throw new ApiError(400, "Not able to fetch subscriptions")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}