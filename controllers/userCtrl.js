const Users = require("../models/userModel");
const Payments = require("../models/paymentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const user = await Users.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ msg: "The email address has already been registered" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long" });
      }

      //Password Encryption
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new Users({
        name,
        email,
        password: hashedPassword,
      });

      //save user to the database
      await newUser.save();

      //creating json webtoken for authentication
      const accessToken = createAccessToken({ id: newUser._id });
      const refreshToken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, //7d
      });
      res.json({ accessToken });
    } catch (e) {
      return res.status(500).json({ msg: e.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });

      if (!user) return res.status(400).json({ msg: "User doesnot exist" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Passwords donot match" });

      const accessToken = createAccessToken({ id: user._id });
      const refreshToken = createRefreshToken({ id: user._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    } catch (e) {
      return res.status(500).json({ msg: e.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshToken", { path: "/user/refresh_token" });
      return res.json({ msg: "Logged out successfully" });
    } catch (e) {
      return res.status(500).json({ msg: e.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshToken;
      if (!rf_token) {
        return res.status(400).json({ message: "Please login or register" });
      }
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.status(400).json({ message: "Please login or register" });
        }
        const accessToken = createAccessToken({ id: user.id });
        res.json({ accessToken });
      });
      res.json({ rf_token });
    } catch (e) {}
  },
  getUser: async (req, res) => {
    try {
      //here we get req.user from auth middleware where we've the id of the user because we've used the id of the user when forming/signing the jwt token
      const user = await Users.findById(req.user.id).select("-password");

      if (!user) return res.status(500).json({ msg: "User doesnot exist" });

      res.json(user);
    } catch (e) {
      return res.status(500).json({ msg: e.message });
    }
  },
  addCart: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user) return res.status(400).json({ msg: "User doesnot exist" });

      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          cart: req.body.cart,
        }
      );
      return res.json({ msg: "Added to the cart" });
    } catch (e) {
      return res.status(500).json({ msg: e.message });
    }
  },
  history: async (req, res) => {
    try {
      const history = await Payments.find({ user_id: req.user.id });
      res.json(history);
    } catch (e) {
      return res.status(500).json({ msg: e.message });
    }
  },
};

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "11m" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = userCtrl;
