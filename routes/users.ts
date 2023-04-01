import express from "express";
const app = express();
import userControler from "../controler/users";

app.post("/register", async (req: any, res: any) => {
  const { username, password, email, createdAt, updatedAt } = req.body;
  await userControler
    .signup({
      username,
      password,
      email,
    })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(err.status || 400).send(err.message || err);
    });
});

app.get("/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  await userControler
    .login({
      email,
      password,
    })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(err.status || 400).send(err.message || err);
    });
});

export default app;
