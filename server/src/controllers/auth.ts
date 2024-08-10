import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../config/auth";

import { User } from "models";

export const signin: RequestHandler = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = req.body.password === user.password;
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86_400,
    });
    res.status(200).send({
      id: user._id,
      username: user.username,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};
