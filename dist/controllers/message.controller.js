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
exports.allMessage = exports.sendMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const message_model_1 = __importDefault(require("../models/message.model"));
const chat_model_1 = __importDefault(require("../models/chat.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const sendMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, chatId } = req.body;
    // Validate input
    if (!content || !chatId) {
        return res.status(400).json({ error: "Content and chatId are required" });
    }
    try {
        // Check if the chat exists
        const chat = yield chat_model_1.default.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        // Create a new message
        const newMessage = yield message_model_1.default.create({
            content,
            chat: chatId,
            sender: req.user._id,
            readBy: [] // Initialize as empty
        });
        // Update the chat with the latest message
        yield chat_model_1.default.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id
        });
        // Fetch the updated chat including the latest message
        const updatedChat = yield chat_model_1.default.findById(chatId)
            .populate({
            path: 'lastMessage',
            populate: {
                path: 'sender',
                select: 'name pic email',
            }
        })
            .populate({
            path: 'users',
            select: 'name pic email'
        });
        if (!updatedChat) {
            return res.status(404).json({ error: "Updated chat not found" });
        }
        // Fetch the sender details
        const sender = yield user_model_1.default.findById(req.user._id).select('name pic');
        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }
        // Assemble the response
        const messageResponse = {
            _id: newMessage._id,
            content: newMessage.content,
            chat: {
                _id: updatedChat._id,
                users: updatedChat.users,
                lastMessage: updatedChat.lastMessage
            },
            sender: {
                _id: sender._id,
                name: sender.name,
                pic: sender.pic
            },
            createdAt: newMessage.createdAt,
        };
        // Send response
        res.status(201).json(messageResponse);
    }
    catch (error) {
        next(error);
    }
}));
exports.sendMessage = sendMessage;
const allMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chatId = req.params.chatId;
        if (!chatId) {
            return res.status(400).json({ error: "Chat ID is required" });
        }
        // Fetch messages along with sender details
        const messages = yield message_model_1.default.find({ chat: chatId })
            .populate({
            path: 'sender',
            select: 'name pic email', // Populate sender details
        })
            .populate({
            path: 'readBy',
            select: 'name pic email', // Populate readBy details if needed
        })
            .sort({ createdAt: +1 }); // Sort messages by newest first
        res.status(200).json(messages);
    }
    catch (error) {
        next(error);
    }
}));
exports.allMessage = allMessage;
