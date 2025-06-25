import jwt from "jsonwebtoken";

export const jwtAuth = async (req, res, next) => {
    try {
      const authorization = req.headers.authorization;
  
      // Check if authorization header is present
      if (!authorization) {
        return res.status(401).json({ msg: "User not logged in: Missing authorization header" });
      }
  
      // Ensure the authorization header has the correct format
      const token = authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ msg: "User not logged in: Token missing" });
      }
  
      // Verify the token
      const decoded = jwt.verify(token, "secreteKey"); // Replace "secreteKey" with an environment variable for production
      req.user = decoded; // Attach decoded token payload to the request object
      next(); // Proceed to the next middleware
    } catch (error) {
      // console.error("JWT Authentication Error:", error.message);
      return res.status(401).json({ msg: "User not logged in: Invalid or expired token" });
    }
  };

export const generateToken = (id) => {
  return jwt.sign({ id }, "secreteKey", { expiresIn: "33D" });
};
