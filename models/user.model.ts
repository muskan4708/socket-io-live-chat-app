import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  pic?: string;
  execPopulate?:any
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pic: { type: String },
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
