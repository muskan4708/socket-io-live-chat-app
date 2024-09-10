"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const db_connection_1 = __importDefault(require("./config/db.connection"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const message_routes_1 = __importDefault(require("./routes/message.routes"));
dotenv_1.default.config();
(0, db_connection_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Serve static files from 'uploads' directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '/uploads')));
const PORT = parseInt(process.env.PORT, 10) || 4000;
app.use('/api/user', userRoutes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/message', message_routes_1.default);
// Middleware for handling 404 errors and other errors
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
const server = app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
// Creating connection with socket.io
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000' // Make sure this matches your client URL
    },
});
io.on('connection', (socket) => {
    console.log('Socket connected successfully');
    // Creating room for user
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log('userDataID********', userData._id);
        socket.emit('connected');
    });
    // Socket for joining/creating the chatroom
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('chatRoom', room);
    });
    //typing conection 
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    ///logic for stop typing
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    socket.on('new message', (newMessageReceived) => {
        // Checking which chat msg is this
        const chat = newMessageReceived.chat;
        if (!chat.users) {
            console.log('chat.users not defined');
            return;
        }
        // If I send a message in a room, it should get received only by others
        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) {
                return;
            }
            socket.to(user._id).emit('message received', newMessageReceived);
        });
    });
    socket.off('setup', (userData) => {
        console.log('userDataID********', userData._id);
        socket.leave(userData._id);
    });
});
