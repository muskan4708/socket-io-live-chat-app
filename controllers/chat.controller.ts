import { Request, Response, NextFunction } from 'express';
import Chat from '../models/chat.model'; // Ensure this uses the correct type for IChat
import asyncHandler from 'express-async-handler';
import User from '../models/user.model'; // Ensure this uses the correct type for IUser
import { Types } from 'mongoose';
import { IChat } from '../models/chat.model';
import { group } from 'console';


interface CustomRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    // Add any other fields that are part of the user object
  };
}

const accessChat = asyncHandler(async (req: any, res:any, next: NextFunction) => {
  const { userId }: { userId: string } = req.body;

  if (!userId) {
    console.log("userId parameter not sent with request");
    return res.status(400).json({ message: "UserId parameter is required" });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: User not found in request" });
  }

  try {
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: new Types.ObjectId(userId) } } }
      ]
    })
    .populate("users", "-password")
    .populate("lastMessage")
    .exec() as IChat[];

    // Populate the sender's information for the last message
    if (chat.length > 0) {
      chat[0] = await Chat.populate(chat[0], {
        path: "lastMessage.sender",
        select: "name pic email"
      }) as IChat;
      
      return res.status(200).json(chat[0]);
    } else {

      // Define chatData as a plain object
      const chatData: any = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, new Types.ObjectId(userId)],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password")
        .populate("lastMessage")
        .exec() as IChat;

      // Populating the sender's information
      const populatedFullChat = await Chat.populate(fullChat, {
        path: "lastMessage.sender",
        select: "name pic email"
      }) as IChat;

      return res.status(200).json(populatedFullChat);
    }
  } catch (error) {
    console.error("Error accessing chat:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});


interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

const fetchChats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user?._id } } })
      .populate("users", "-password")
      .populate("lastMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 })  
      .exec(); 

    chats = await Chat.populate(chats, {
      path: "lastMessage.sender",
      select: "name pic email",
    });

    res.status(200).json(chats);
  } catch (error) {

    res.status(500).json({ message: 'Failed to fetch chats', error });
  }
});  
//create a group chat
interface NewRequest extends Request {
  user?: any; // Adjust the type according to the structure of your `user`
}

const createGroupchat = asyncHandler(async (req: NewRequest, res: any) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all fields" });
  }
  let users;
  try {
    users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;
  } catch (error) {
    return res.status(400).json({ message: "Invalid users data format" });
  }

  // Ensure users is an array and has at least 2 users
  if (!Array.isArray(users) || users.length < 2) {
    return res.status(400).json({ message: "At least 2 users are required" });
  }

  // Add the current user to the list of users
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: "Internal server error"});
  }
});

//rename group name 

const renameGroup =asyncHandler(async(req:Request,res:Response)=>{
  const {chatId, chatName} = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,{
      chatName: chatName, 
    },
    {
      new: true,
    }

  )
  .populate("users","-password")
  .populate("groupAdmin","-password")
  if(!updatedChat){
    res.status(400);
    throw new Error("Chat not found")
  }
  else{
    res.status(200).json(updatedChat)
  }

})

// add to group
const addToGroup = asyncHandler(async (req: Request, res: Response) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatId, // The ID of the chat document to update
    {
      $push: { users: userId }, 
    },
    {
      new: true, 
    }
  )
  .populate("users", "-password") // Populate the `users` array, excluding the `password` field
  .populate("groupAdmin", "-password"); // Populate the `groupAdmin` field, excluding the `password` field

  if(!chat){
    res.status(400)
    throw new Error("Chat not found")
  }
  else{
    res.status(200).json(chat)
  }
});

//remove from group
const removefromGroup = asyncHandler(async (req: Request, res: Response) => {
  const { chatId, userId } = req.body;

  // Validate input
  if (!chatId || !userId) {
    res.status(400).json({ message: 'Chat ID and User ID are required' });
    return;
  }

  // Find the user to be removed
  const userToRemove = await User.findById(userId).select('-password'); // Exclude password

  if (!userToRemove) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Log the details of the user being removed
  console.log('Removing user:', userToRemove);

  // Update the chat by removing the user
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
  .populate("users", "-password") // Populate users excluding password
  .populate("groupAdmin", "-password"); // Populate groupAdmin excluding password

  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
  } else {
    // Return only the removed user in the response
    res.status(200).json(userToRemove);
  }
});


interface NewRequest1 extends Request {
  user?: {
    _id: string;
    // Add other properties if needed
  };
}


const leaveGroup = asyncHandler(async (req:NewRequest,res:any) => {
  const { chatId } = req.body;
  const userId = req.user?._id; 
  // Validate input
  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required" });
  }
//finding chat through chat id
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
//finding user chat by user ID
  if (!chat.users.includes(userId)) {
    return res.status(400).json({ message: "User not in this chat" });
  }

  chat.users = chat.users.filter(user => user.toString() !== userId.toString());


  await chat.save();

  res.status(200).json(chat);
});

export{ accessChat,fetchChats,createGroupchat,renameGroup,addToGroup,removefromGroup,leaveGroup};
