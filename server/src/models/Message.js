import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: '', maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Message = mongoose.model('Message', messageSchema);
