import { Router } from "express";
import {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser,updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.fields([{name: "avatar", maxCount: 1},{name: "coverImage", maxCount: 1}]), registerUser )  //middleware injected 

router.route("/login").post(loginUser)

//secured Routes (routes after logging in)
router.route("/logout").post(verifyJWT, logoutUser) //verifyJWT verifies that the user is loggedIn
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)// if you use post instead of patch then all the details will get updated

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile) //this route is named like this specifically because user.params is being used inside the method
router.route("/history").get(verifyJWT, getWatchHistory)

export default router