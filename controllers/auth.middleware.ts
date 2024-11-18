import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import asyncHandler from 'express-async-handler';

// Define an interface for the request object with the user property
interface IRequest extends Request {
  user?: any; // You can replace 'any' with the actual user type if defined
}

// Middleware to protect routes
const protect = asyncHandler(async (req: IRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify the token and decode it
      const decoded = jwt.verify(token, process.env.JWT_TOKEN as string) as { id: string };

      // Find the user and attach it to the request object
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };
