import {
    getAllUsers,
    createUser as createUserService,
    loginUser as loginUserService
} from "../services/user.service.js";

const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();

        res.status(200).json({
            users
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const user = await createUserService(req.body);

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
const loginUser = async (req, res) => {
    try {
        const result = await loginUserService(
            req.body.email,
            req.body.password
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({
            message: error.message
        });
    }
};

export {
    getUsers,
    createUser,
    loginUser
};