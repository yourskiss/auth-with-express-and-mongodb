import mongoose from "mongoose";
const tblSchema = new mongoose.Schema(
  {
      profilepicture: {
        url: { type: String, default: null },  
        filename: { type: String, default: null }, 
        contentType: { type: String, default: null }  
      },
      fullname: { type: String, required: true, trim: true },
      mobile: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true, trim: true   },
      gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
      dob: { type: Date, default: null },
      address: {
          house: { type: String, default: null, trim: true },
          street: { type: String, default: null, trim: true },
          city: { type: String, default: null, trim: true },
          state: { type: String, default: null, trim: true },
          country: { type: String, default: null, trim: true },
          pincode: { type: String, default: null, trim: true }
      },      
      role: { 
        type: String, 
        required: true, 
        enum: ['user', 'admin', 'superadmin'] ,
        default: 'user'
      },
      otpTemp: { type: String, default:null },
      otpExpiry: { type: Date, default:null },

      isDeleted: { type: Boolean, default: false },
      isVerifiedEmail: { type: Boolean, default: false },
      isVerifiedMobile: { type: Boolean, default: false },

      createdAt: { type: Date, default: () => new Date() },
      updatedAt: { type: Date, default: null },
      deletedAt: { type: Date, default: null },
      
      createdBy: { type: mongoose.Schema.Types.ObjectId, default:null },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
      deletedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
 // { timestamps: true }
);

// const collection_name = process.env.COL_USERS;
// if (!collection_name) {
//   throw new Error('❌ Models : Missing collection name in environment variables.');
// }

const collection_name = process.env.COL_USERS ?? (() => 
  { 
    throw new Error('❌ Missing collection name in environment variables.') 
  })();

 

const userModels = mongoose.model(
  'userlist', 
  tblSchema,
  collection_name 
);

export default userModels;
