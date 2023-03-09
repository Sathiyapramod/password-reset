import { client } from "../index.js";
import bcrypt from "bcrypt";

export async function newSignup(username, hashedPassword, email) {
  return await client.db("passwordflow").collection("signup").insertOne({
    username,
    email,
    password: hashedPassword,
  });
}
export async function newSignin(username) {
  return await client
    .db("passwordflow")
    .collection("signup")
    .findOne({ username });
}
export async function getHashedPassword(password) {
  const No_of_Rounds = 10;
  const salt = await bcrypt.genSalt(No_of_Rounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
export async function getAllUsers() {
  return client.db("passwordflow").collection("signup").find({}).toArray();
}
export async function checkUsernamefromDB(username, email) {
  return await client
    .db("passwordflow")
    .collection("signup")
    .find({ username, email })
    .toArray();
}

export async function checkEmailIdfromDb(email) {
  return await client
    .db("passwordflow")
    .collection("signup")
    .find({ email })
    .toArray();
}

export async function getUserbyEmail(email) {
  return await client
      .db("passwordflow")
      .collection("signup")
      .find({ email })
      .toArray();
}
export async function changePasswordinDB(username, newHashedPassword) {
  return await client
      .db("passwordflow")
      .collection("signup")
      .findOneAndUpdate(
          { username: username },
          { $set: { password: newHashedPassword }, $unset: { RandomNumber: "" } }
      );
}

export async function checkOTPinDB(codeword) {
  return await client
      .db("passwordflow")
      .collection("signup")
      .find({ RandomNumber: codeword })
      .toArray();
}

export async function updateOTPinDb(email, random) {
  return await client
      .db("passwordflow")
      .collection("signup")
      .findOneAndUpdate({ email: email }, { $set: { RandomNumber: random } });
}
