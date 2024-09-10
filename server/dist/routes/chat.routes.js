"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../controllers/auth.middleware");
const chat_controller_1 = require("../controllers/chat.controller");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.protect, (req, res, next) => (0, chat_controller_1.accessChat)(req, res, next));
router.get('/', auth_middleware_1.protect, (req, res, next) => (0, chat_controller_1.fetchChats)(req, res, next));
router.post('/group', auth_middleware_1.protect, (req, res, next) => (0, chat_controller_1.createGroupchat)(req, res, next));
router.put('/rename', auth_middleware_1.protect, (req, res, next) => (0, chat_controller_1.renameGroup)(req, res, next));
router.put('/groupremove', auth_middleware_1.protect, (req, res, next) => (0, chat_controller_1.removefromGroup)(req, res, next));
router.put('/groupadd', auth_middleware_1.protect, (req, res, next) => (0, chat_controller_1.addToGroup)(req, res, next));
router.put('/leaveGroup', auth_middleware_1.protect, (req, res, next) => (0, chat_controller_1.leaveGroup)(req, res, next));
exports.default = router;
