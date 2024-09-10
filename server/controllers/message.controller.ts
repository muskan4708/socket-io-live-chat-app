import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Message from '../models/message.model'; 
import Chat from '../models/chat.model'; 
import User from '../models/user.model';
const sendMessage = asyncHandler(async (req: any, res: any, next: NextFunction) => {
    const { content, chatId } = req.body;

    // Validate input
    if (!content || !chatId) {
        return res.status(400).json({ error: "Content and chatId are required" });
    }

    try {
        // Check if the chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        // Create a new message
        const newMessage = await Message.create({
            content,
            chat: chatId,
            sender: req.user._id,
            readBy: [] // Initialize as empty
        });

        // Update the chat with the latest message
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id
        });

        // Fetch the updated chat including the latest message
        const updatedChat = await Chat.findById(chatId)
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
        const sender = await User.findById(req.user._id).select('name pic');
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
    } catch (error) {
        next(error);
    }
});

const allMessage = asyncHandler(async (req: any, res: any, next: NextFunction) => {
   
    try {
        const chatId = req.params.chatId;
    
        if (!chatId) {
          return res.status(400).json({ error: "Chat ID is required" });
        }
    
        // Fetch messages along with sender details
        const messages = await Message.find({ chat: chatId })
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
      } catch (error) {
        next(error);
      }
    });
    


export { sendMessage ,allMessage};
