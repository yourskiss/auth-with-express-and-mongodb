import mongoose from "mongoose";
const tblSchema = new mongoose.Schema(
  {
      profilepicture: {
        url: { type: String, default: null },        // e.g. "https://s3.amazonaws.com/....jpg" or "/uploads/users/abc.jpg"
        filename: { type: String, default: null },   // optional: store original filename
        contentType: { type: String, default: null } // e.g. "image/jpeg"
      },
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
      otpTemp: { type: String, default:null },
      otpExpiry: { type: Date, default:null },

      isDeleted: { type: Boolean, default: false },

      createdAt: { type: Date, required: true, required: true, default:new Date() },
      updatedAt: { type: Date, default: null },
      deletedAt: { type: Date, default: null },
      
      createdBy: { type: mongoose.Schema.Types.ObjectId, default:null },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
      deletedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
 // { timestamps: true }
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
