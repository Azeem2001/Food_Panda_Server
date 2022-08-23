import express from "express";
import User from "../../modals/User/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";

const router = express();
const secretJwtKey = config.get("jwtSecret");

const hashPassword = async (password) => {
  let salts = 10;
  let resultHash = await bcrypt.hash(password, salts);
  return resultHash;
};

const comparePassword = async (hashPass, password) => {
  let resultBool = bcrypt.compare(password, hashPass);
  return resultBool;
};

router.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, status: "User already existed" });
    }
    user = new User({
      email,
      password: await hashPassword(password),
      usertype: "CLIENT",
    });
    await user.save();
    let payload = {
      id: user._id,
    };
    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res
          .status(200)
          .json({ success: true, status: "Register successfully", token });
      }
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, status: "User not exits" });
    }
    let isPassword = await comparePassword(user?.password, password);
    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, status: "Invalid password" });
    }
    let payload = {
      id: user._id,
    };
    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res
          .status(200)
          .json({ success: true, status: "Login successfully", token });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

export default router;
