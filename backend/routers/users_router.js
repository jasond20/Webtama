import { User } from "../models/users.js";
import { Router } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import pkg from "@sendgrid/mail"
import { isAuthenticated } from "../middleware/helpers.js";

export const usersRouter = Router();
const upload = multer({ dest: "uploads/" });

usersRouter.post("/signup", async (req, res) => {
  const user = User.build({
    username: req.body.username,
    email: req.body.email,
  });
  // generate password - salted and hashed
  /** 
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(password, salt);
  */
  try {
    await user.save();
  } catch (err) {
    console.log(err);
    return res.status(422).json({ error: "User creation failed." });
  }
  req.session.userId = user.id;
  req.session.save();
});

//Get all users
usersRouter.get("/", async (req, res) => {
  const users = await User.findAll();
  return res.json(users);
});

usersRouter.post("/signin", async (req, res) => {
  console.log("req.headers", req.headers);
  console.log(req.body);
  let user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (user === null) {
    user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });
  }
  if (user === null) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  // password incorrect
  /** 
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  */

  req.session.userId = user.id;
  req.session.save();
  console.log(req.session);
  return res.json(user);
});

usersRouter.get("/signout", function (req, res, next) {
  req.session.destroy();
  return res.json({ message: "Signed out." });
});

usersRouter.get("/me", isAuthenticated, async (req, res) => {
  console.log("req.headers", req.headers);
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authorized." });
  }
  const user = await User.findByPk(req.session.userId);
  return res.json(user);
});
