const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "Email must be unique"],
    },
    phone: {
      type: Number,
      required: true,
      unique: [true, "Email must be unique"],
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    description: String,
    orderCount: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    authCode: Number,
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: String,
    isSeller: {
      type: Boolean,
      default: false,
    },
    category: String,
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    buyerRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BuyerRequest",
      },
    ],
    sellerProposals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    console.log("Password modified");
    bcrypt.hash(this.password, 8, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      console.log("Hashing");
      return next();
    });
  } else {
    return next();
  }
});

userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password missing");

  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", userSchema);
module.exports = User;
