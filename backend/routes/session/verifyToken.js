const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = req.cookies?.token || bearer || "";

    if (!token) return res.status(401).json("you need to login");

    const decoded = jwt.verify(token, process.env.tokenSecret);
    req.user = decoded || {};

    next();
  } catch (err) {
    console.error("verifyToken error:", err.message);
    return res.status(401).json("invalid or expired token");
  }
};

module.exports = verifyToken;