import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from '../models/user.model.js'
import ApiResponse from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req, res ) => {
    // res.status(200).json({
    //     message: "OK Youtube"
    // })

    const {fullName, email, username, password} = req.body
    // console.log(`email :`, email);

    if (
        [
        fullName,
        email,
        username,
        password,
    ].some( (field) => field?.trim() === "" )) {
        throw new ApiError(400, "All Feilds are required");
    } 

    const existedUser = await User.findOne({
        $or: [
            {
                username
            },
            {
                email
            },
        ]})
    
        if  (existedUser) {
            throw new ApiError(409, "User Already Existed");
        }


        const avatarLocalPath = req.files?.avatar[0]?.path // to check from multer in express to check about the files

        // let coverImagePath = req.files?.coverImage[0].path;
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");

        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            throw new ApiError(400, "Avatar is needed")
        }

        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong, Server Side issue");
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User Created Successfully")
        )
} )

export {registerUser}