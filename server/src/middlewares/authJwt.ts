import jwt from "jsonwebtoken";
import config from "../config/auth";
import { Request, RequestHandler } from "express";

const verifyToken: RequestHandler = (
  req: Request & { userId: string },
  res,
  next
) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(`${token}`, config.secret, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Unauthorized!" });
    req.userId = typeof decoded === "string" ? decoded : decoded.id;
    next();
  });
};

const authJwt = {
  verifyToken: (req, res, next) => next(),
};

export default authJwt;
