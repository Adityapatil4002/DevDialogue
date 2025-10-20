import jwt from "jsonwebtoken";
import redisClient from "../Services/redis.service.js";


export const authUser = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      // Correctly get token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];
    }
    // If not in header, check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token is found in either place, send error
    if (!token) {
      return res.status(401).send({ error: "Unauthorized: No token provided" });
    }

    const isBlackListed = await redisClient.get(token);
      if (isBlackListed) {
          res.cookie('token', '');
      return res.status(401).send({ error: "Unauthorized: Token is blacklisted" });
    }
      
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next(); // Move to the next function (profileController)
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
