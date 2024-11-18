"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveGroup = exports.removefromGroup = exports.addToGroup = exports.renameGroup = exports.createGroupchat = exports.fetchChats = exports.accessChat = void 0;
const chat_model_1 = __importDefault(require("../models/chat.model")); // Ensure this uses the correct type for IChat
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_model_1 = __importDefault(require("../models/user.model")); // Ensure this uses the correct type for IUser
const mongoose_1 = require("mongoose");
const accessChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        console.log("userId parameter not sent with request");
        return res.status(400).json({ message: "UserId parameter is required" });
    }
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not found in request" });
    }
    try {
        let chat = yield chat_model_1.default.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: new mongoose_1.Types.ObjectId(userId) } } }
            ]
        })
            .populate("users", "-password")
            .populate("lastMessage")
            .exec();
        // Populate the sender's information for the last message
        if (chat.length > 0) {
            chat[0] = (yield chat_model_1.default.populate(chat[0], {
                path: "lastMessage.sender",
                select: "name pic email"
            }));
            return res.status(200).json(chat[0]);
        }
        else {
            // Define chatData as a plain object
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, new mongoose_1.Types.ObjectId(userId)],
            };
            const createdChat = yield chat_model_1.default.create(chatData);
            const fullChat = yield chat_model_1.default.findOne({ _id: createdChat._id })
                .populate("users", "-password")
                .populate("lastMessage")
                .exec();
            // Populating the sender's information
            const populatedFullChat = yield chat_model_1.default.populate(fullChat, {
                path: "lastMessage.sender",
                select: "name pic email"
            });
            return res.status(200).json(populatedFullChat);
        }
    }
    catch (error) {
        console.error("Error accessing chat:", error);
        return res.status(500).json({ message: "Server error", error });
    }
}));
exports.accessChat = accessChat;
const fetchChats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let chats = yield chat_model_1.default.find({ users: { $elemMatch: { $eq: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id } } })
            .populate("users", "-password")
            .populate("lastMessage")
            .populate("groupAdmin", "-password")
            .sort({ updatedAt: -1 })
            .exec();
        chats = yield chat_model_1.default.populate(chats, {
            path: "lastMessage.sender",
            select: "name pic email",
        });
        res.status(200).json(chats);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch chats', error });
    }
}));
exports.fetchChats = fetchChats;
const createGroupchat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({ message: "Please fill all fields" });
    }
    let users;
    try {
        users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;
    }
    catch (error) {
        return res.status(400).json({ message: "Invalid users data format" });
    }
    // Ensure users is an array and has at least 2 users
    if (!Array.isArray(users) || users.length < 2) {
        return res.status(400).json({ message: "At least 2 users are required" });
    }
    // Add the current user to the list of users
    users.push(req.user);
    try {
        const groupChat = yield chat_model_1.default.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });
        const fullGroupChat = yield chat_model_1.default.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.createGroupchat = createGroupchat;
//rename group name 
const renameGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, chatName } = req.body;
    const updatedChat = yield chat_model_1.default.findByIdAndUpdate(chatId, {
        chatName: chatName,
    }, {
        new: true,
    })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!updatedChat) {
        res.status(400);
        throw new Error("Chat not found");
    }
    else {
        res.status(200).json(updatedChat);
    }
}));
exports.renameGroup = renameGroup;
// add to group
const addToGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, userId } = req.body;
    const chat = yield chat_model_1.default.findByIdAndUpdate(chatId, // The ID of the chat document to update
    {
        $push: { users: userId },
    }, {
        new: true,
    })
        .populate("users", "-password") // Populate the `users` array, excluding the `password` field
        .populate("groupAdmin", "-password"); // Populate the `groupAdmin` field, excluding the `password` field
    if (!chat) {
        res.status(400);
        throw new Error("Chat not found");
    }
    else {
        res.status(200).json(chat);
    }
}));
exports.addToGroup = addToGroup;
//remove from group
const removefromGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, userId } = req.body;
    // Validate input
    if (!chatId || !userId) {
        res.status(400).json({ message: 'Chat ID and User ID are required' });
        return;
    }
    // Find the user to be removed
    const userToRemove = yield user_model_1.default.findById(userId).select('-password'); // Exclude password
    if (!userToRemove) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    // Log the details of the user being removed
    console.log('Removing user:', userToRemove);
    // Update the chat by removing the user
    const chat = yield chat_model_1.default.findByIdAndUpdate(chatId, {
        $pull: { users: userId },
    }, {
        new: true,
    })
        .populate("users", "-password") // Populate users excluding password
        .populate("groupAdmin", "-password"); // Populate groupAdmin excluding password
    if (!chat) {
        res.status(404).json({ message: 'Chat not found' });
    }
    else {
        // Return only the removed user in the response
        res.status(200).json(userToRemove);
    }
}));
exports.removefromGroup = removefromGroup;
const leaveGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { chatId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    // Validate input
    if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" });
    }
    //finding chat through chat id
    const chat = yield chat_model_1.default.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    //finding user chat by user ID
    if (!chat.users.includes(userId)) {
        return res.status(400).json({ message: "User not in this chat" });
    }
    chat.users = chat.users.filter(user => user.toString() !== userId.toString());
    yield chat.save();
    res.status(200).json(chat);
}));
exports.leaveGroup = leaveGroup;
