import { Schema } from 'mongoose';

export interface INote {
  text: string;
  createdAt?: Date;
}

export const NoteSchema = new Schema<INote>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});