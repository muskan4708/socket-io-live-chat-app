"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller"); // Ensure loginUser is imported
const user_middleware_1 = __importDefault(require("../middleware/user.middleware")); // Assuming you have a middleware for handling file uploads
const auth_middleware_1 = require("../controllers/auth.middleware");
const router = express_1.default.Router();
// Route for user registration
router.post('/register', user_middleware_1.default.single('pic'), (req, res, next) => (0, user_controller_1.registerUser)(req, res, next));
// Route for user login
router.post('/login', (req, res, next) => (0, user_controller_1.loginUser)(req, res, next));
// Route for fetching all users
router.get('/allUser', auth_middleware_1.protect, (req, res, next) => (0, user_controller_1.allUsers)(req, res, next));
exports.default = router;
