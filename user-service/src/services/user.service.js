import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { publishUserCreated } from "../config/nats.js";

const getAllUsers = async () => {
    return await User.find();
};

const createUser = async (userData) => {

    if (!userData.name || !userData.email || !userData.password) {
        throw new Error("Name, email and password are required");
    }

    const existingUser = await User.findOne({
        email: userData.email
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await User.create({
        ...userData,
        password: hashedPassword
    });

    const userResponse = user.toObject();

    delete userResponse.password;

    console.log("About to publish user.created event");

    await publishUserCreated(userResponse);

    return userResponse;
};

const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h"
        }
    );

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};

export {
    getAllUsers,
    createUser,
    loginUser
};