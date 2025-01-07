import  mongoose  from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    dateOfBirth: {
      type: Date,
      required: true
    },
    password: {
      type: String,
      required: true,
    },
    registrationDate: {
      type: Date,
      required: true
    },

    avatar: {
      type: String,
    },
    
    role: {
      type: String,
      enum: ['admin', 'usuario'],
      default: 'usuario',
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const User = mongoose.model('User', userSchema);

export default User