import dotenv from "dotenv";
dotenv.config();
import express from "express";

import userRouter from "./routes/users";
import fileRouter from "./routes/file";

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/users", userRouter);
app.use("/files", fileRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});

export default app;
