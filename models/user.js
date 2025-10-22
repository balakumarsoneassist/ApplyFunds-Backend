// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// module.exports = mongoose.model("User", UserSchema);
// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   mobile: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   userType: { type: String, enum: ["Employee", "Partners", "Customer"], required: true },
// }, { timestamps: true });

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);


