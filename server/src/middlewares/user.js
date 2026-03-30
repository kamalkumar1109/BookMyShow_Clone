const { AuthenticationError, ForbiddenError, NotFoundError } = require("../core/ApiError");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const { jwtSecret: JWT_SECRET } = require("../config/env");

const isLoggedIn = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    throw new AuthenticationError("Please login to continue");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    req.userId = userId;
    next();
  } catch (err) {
    throw new AuthenticationError("Invalid or expired token");
  }
};

const isPartner = async (req, res, next) => {
  const { userId } = req;

  if (!userId) {
    throw new AuthenticationError("Please login to continue");
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isAllowedRole = user.role === "Partner" || user.role === "Admin";
  if (!isAllowedRole && !user.isPartner()) {
    throw new ForbiddenError("You are not allowed to access this");
  }

  next();
};

module.exports = {
  isLoggedIn,
  isPartner,
};