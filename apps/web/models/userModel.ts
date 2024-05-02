import mongoose, { Model } from "mongoose";

export interface userType {
  _id?: string;
  name: string;
  photo: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  name: { type: String },
  photo: {
    type: String,
    default: "/uploads/person.png",
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
// const userModel = mongoose.models.Users<userType> || mongoose.model<userType>("Users", userSchema);
function createUserModel(): Model<userType> {
  // Check if the model already exists
  if (mongoose.models.Users) {
    return mongoose.model<userType>("Users");
  } else {
    // Create a new model
    return mongoose.model<userType>("Users", userSchema);
  }
}

// Use the function to get the model
const userModel = createUserModel();
// const userModel =
//   mongoose.model<userType>("Users") ||
//   mongoose.model<userType>("Users", userSchema);
export default userModel;
