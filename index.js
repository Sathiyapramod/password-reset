//start of code
import cors from 'cors';
import * as dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import router from './router/password.router.js'

dotenv.config();
// const MONGO_URL = "mongodb://127.0.0.1";
const MONGO_URL = process.env.MONGO_URL;
export const client = new MongoClient(MONGO_URL); //dialing operation
await client.connect(); //This is a calling operation

const app = express();
app.use(express.json()); //installing common middleware
app.use(cors()); //installing cors
app.use("/password",router);
const PORT = 4000;

app.get("/", (request, response) => {
  console.log("Hello World");
  response.send({"message":"Password Reset Chap"})
});

app.listen(PORT, () =>
  console.log(`The Server is running on the port : ${PORT} 😉`)
);

//end of code