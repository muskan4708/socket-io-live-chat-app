import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IChat extends Document {
  chatName: string;
  isGroupChat: boolean;
  users: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  groupAdmin?: Types.ObjectId;
}

const chatSchema: Schema<IChat> = new Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    groupAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Chat: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;
