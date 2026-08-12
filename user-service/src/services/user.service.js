import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
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

export {
    getAllUsers,
    createUser
};