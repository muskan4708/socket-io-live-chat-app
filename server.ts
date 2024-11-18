import express, { Express } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/userRoutes';
import Connection from './config/db.connection';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import messageRoutes from './routes/message.routes';

dotenv.config();
Connection();

const app: Express = express();
app.use(express.json());
app.use(cors());

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const PORT: number = parseInt(process.env.PORT as string, 10) || 4000;

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/message', messageRoutes);

// Middleware for handling 404 errors and other errors
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

// Creating connection with socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000' // Make sure this matches your client URL
  },
});

// Define interfaces for socket data
interface User {
  _id: string;
}

interface Chat {
  users: User[];
}

interface NewMessageReceived {
  chat: Chat;
  sender: User;
}

io.on('connection', (socket: any) => {
  console.log('Socket connected successfully');

  // Creating room for user
  socket.on('setup', (userData: User) => {
    socket.join(userData._id);
    console.log('userDataID********', userData._id);
    socket.emit('connected');
  });

  // Socket for joining/creating the chatroom
  socket.on('join chat', (room: string) => {
    socket.join(room);
    console.log('chatRoom', room);
  });


  //typing conection 
  socket.on("typing",(room:any)=>socket.in(room).emit("typing"))

  ///logic for stop typing
  socket.on("stop typing",(room:any)=>socket.in(room).emit("stop typing"))
  socket.on('new message', (newMessageReceived: NewMessageReceived) => {
    // Checking which chat msg is this
    const chat = newMessageReceived.chat;

    if (!chat.users) {
      console.log('chat.users not defined');
      return;
    }

    // If I send a message in a room, it should get received only by others
    chat.users.forEach((user: User) => {
      if (user._id === newMessageReceived.sender._id) {
        return;
      }
      socket.to(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.off('setup', (userData: User) => {

    console.log('userDataID********', userData._id);
    socket.leave(userData._id);
  });
});
