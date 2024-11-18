"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../controllers/auth.middleware");
const message_controller_1 = require("../controllers/message.controller");
const router = express_1.default.Router();
router.post('/sendMessage', auth_middleware_1.protect, (req, res, next) => (0, message_controller_1.sendMessage)(req, res, next));
router.get('/:chatId', auth_middleware_1.protect, (req, res, next) => (0, message_controller_1.allMessage)(req, res, next));
exports.default = router;
