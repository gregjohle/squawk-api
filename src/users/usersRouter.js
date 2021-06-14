const express = require("express"),
  path = require("path"),
  xss = require("xss"),
  UsersService = require("./usersService.js"),
  UsersRouter = express.Router(),
  jsonParser = express.json(),
  bcrypt = require("bcryptjs");

// route to login a specific user
UsersRouter.route("/login").post((req, res, next) => {
  let { email, password } = req.body;
  UsersService.getByEmail(req.app.get("db"), email).then((user) => {
    if (user === undefined) {
      return res.status(404).send("No User found.");
    } else if (bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        name: user.name,
        email: user.email,
        id: user.id,
      });
    } else {
      return res.status(401).send("Invalid Password");
    }
  });
});

// Route to add a new user to the site
UsersRouter.route("/register").post((req, res, next) => {
  const { name, email, password } = req.body;
  UsersService.getByEmail(req.app.get("db"), email).then((user) => {
    if (user) {
      res.send("A User already exists with that email.");
    }
    if (!user) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = {
        name: xss(name),
        email: xss(email),
        password: hashedPassword,
      };
      UsersService.insertUser(req.app.get("db"), newUser)
        .then(UsersService.getByEmail(req.app.get("db"), email))
        .then((user) => {
          if (user === undefined) {
            return res.send("user not created");
          }
          return res.status(201).send("user added");
        })
        .catch(next);
    }
  });
});

module.exports = UsersRouter;
