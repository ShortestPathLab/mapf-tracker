import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import config from "../config/auth";

import { User } from "models";

export const signin: RequestHandler = (req, res) => {
  User.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

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
      expiresIn: 86400,
    });
    res.status(200).send({
      id: user._id,
      username: user.username,
      accessToken: token,
    });
  });
};
