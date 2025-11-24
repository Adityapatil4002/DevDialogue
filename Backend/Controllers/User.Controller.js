import userModel from "../Models/user.model.js";
import * as userService from "../Services/User.service.js";
import { validationResult } from "express-validator";
import redisClient from "../Services/redis.service.js";

export const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userService.createUser(req.body);
        const token = await user.generateJWT();
        delete user._doc.password;
        res.status(201).json({ user, token });
        } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const token = await user.generateJWT();
        delete user._doc.password;
        res.status(200).json({ user, token });
        } catch (err) {
            res.status(400).send(err.message);
        }
}
    
export const profileController = async (req, res) => {
    console.log(req.user);

    res.status(200).json({
        user: req.user
    });

}

export const logoutController = async (req, res) => { 
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        res.status(200).json({
            message: 'Logged out successfully'
        })


    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}

export const getAllUsersController = async (req, res) => { 
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({
            userId: loggedInUser._id
        });

        return res.status(200).json({
            users: allUsers
        })
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    
    }
}

export const updateProfileController = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming authMiddleware populates req.user
        const { name, bio, settings } = req.body;

        // Find user and update specific fields
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name: name,
                    bio: bio,
                    settings: settings
                }
            },
            { new: true } // Return the updated document
        ).select('-password'); // Exclude password from result

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}