const Users = require("../models/userModel");

const authAdmin = async (req, res, next) => {
  try {
    //here the authadmin gets the user in req object from the auth middleware because wherever the authaAdmin middleware is used, it is used along with auth middleware
    const user = await Users.findOne({ _id: req.user.id });

    if (user.role === 0)
      return res.status(400).json({ msg: "Admin resources access denied" });

    next();
  } catch (e) {
    return res.status(500).json({ msg: e.message });
  }
};

module.exports = authAdmin;
