import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("Auth Middleware: No Authorization header provided");
    return res.status(401).json({ message: "No Authorization header provided" });
  }

  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.replace("Bearer ", "").trim() 
    : authHeader.trim();

  if (!token) {
    console.log("Auth Middleware: No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    console.log("Auth Middleware: Token verified, user:", decoded);
    next();
  } catch (error) {
    console.error("Auth Middleware: Token verification failed:", {
      error: error.name,
      message: error.message,
      token: token.substring(0, 10) + "..." 
    });
    return res.status(401).json({ message: "Invalid token" });
  }
};