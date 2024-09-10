import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import generateToken from '../config/generateToken';

// Register user
const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const pic = (req.file as Express.Multer.File)
        ? `${req.protocol}://${req.get('host')}/uploads/${(req.file as Express.Multer.File).filename}`
        : undefined;

    
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please enter all fields");
    }

  
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword, 
        pic,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id.toString())
        });
    } else {
        res.status(400);
        throw new Error("Failed to create the user");
    }
});

// Login user
const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

   
    if (!email || !password) {
        res.status(400);
        throw new Error("Please enter all fields");
    }

  
    const user = await User.findOne({ email });


    if (user && (await bcrypt.compare(password, user.password))) {
      

        const token = generateToken(user._id.toString());

      
        res.cookie('authToken', token, {
            httpOnly: true, 
           
            maxAge: 24 * 60 * 60 * 1000 
        });

     
        res.setHeader('Authorization', `Bearer ${token}`);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// Get all users with optional search functionality
const allUsers = asyncHandler(async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string;
    const keyword = searchQuery ? {
        $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
        ],
    } : {};

    const users = await User.find(keyword);
    res.json(users);
});

export { registerUser, loginUser, allUsers };

