import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true, // prevent XSS (Cross-Site Scripting) attacks
    sameSite: "strict", // prevent CSRF (Cross-Site Request Forgery) attacks
    secure: process.env.NODE_ENV !== "development",
  });
};
