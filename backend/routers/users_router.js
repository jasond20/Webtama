import { User } from "../models/users.js";
import { Router } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import sgMail from "@sendgrid/mail";

export const usersRouter = Router();
const upload = multer({ dest: "uploads/" });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: "jasoncndai@gmail.com",
  from: "keia.r.ahmati@gmail.com",
  subject: "I'm a colossal slut",
  text: "no bitches",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};

sgMail.send(msg).then(() => {});

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
  req.session.userId = user.id;
  req.session.save();
  return res.json(user);
});

usersRouter.get("/signout", function (req, res, next) {
  req.session.destroy();
  return res.json({ message: "Signed out." });
});

usersRouter.get("/me", async (req, res) => {
  console.log("SCREAMING" + req.session);
  if (!req.session.userId) {
    return res.status(401).json({ errors: "Not Authenticaed" });
  }
  return res.json({
    userId: req.session.userId,
  });
});

usersRouter.patch("/:id/join", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  user.activeRoom = req.body.roomId;
  await user.save();
  return res.json(user);
});

usersRouter.get("/:id/rooms", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  const roomId = user.activeRoom;
  return res.json(roomId);
});
