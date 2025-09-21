import mongoose from "mongoose";


const tblSchema = new mongoose.Schema(
  {
      fullname: { type: String, required: true, trim: true },
      mobile: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true, trim: true   },
      role: { 
        type: String, 
        required: true, 
        enum: ['user', 'admin', 'superadmin'] ,
        default: 'user'
      },
      otpTemp: { type: String },
      otpExpiry: { type: Date },

      isDeleted: { type: Boolean, default: false },
      deletedAt: { type: Date, default: null },
      deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

const collection_name = process.env.COL_USERS;
if (!collection_name) {
  throw new Error('❌ Models : Missing collection name in environment variables.');
}

const userModels = mongoose.model(
  'userlist', 
  tblSchema,
  collection_name 
);

export default userModels;
