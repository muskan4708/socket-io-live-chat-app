import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./user.model"; // Assuming you have a user model
import { IChat } from "./chat.model" // Assuming you have a chat model

// Define an interface representing a Message document in MongoDB.
export interface IMessage extends Document {
  sender: IUser["_id"];
  content: string;
  chat: IChat["_id"];
  createdAt?: Date;
  readBy: IUser[]; // List of users who have read the message
  updatedAt?: Date;
}

// Create the schema corresponding to the document interface.
const messageSchema: Schema<IMessage> = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true, required: true },
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who have read the message
  },
  {
    timestamps: true,
  }
);

// Create a model based on the schema.
const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
