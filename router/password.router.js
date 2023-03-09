import express from "express";
import nodemailer from "nodemailer";
import Randomstring from "randomstring";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  getHashedPassword,
  newSignup,
  newSignin,
  getAllUsers,
  checkUsernamefromDB,
  checkEmailIdfromDb,
  getUserbyEmail,
  changePasswordinDB,
  checkOTPinDB,
  updateOTPinDb,
} from "../service/password.service.js";
const router = express.Router();

const options = {
  charset: "alphabetic",
  length: 8,
};

//GET Users lists
router.get("/users", async (request, response) => {
  const getUserList = await getAllUsers();
  getUserList
    ? response.send(getUserList)
    : response.status(404).send({ message: "User Lists Doesn't Exists !!" });
});

//Sign up Operations
router.post("/signup", async (request, response) => {
  const { username, email, password } = request.body;
  if (email == null)
    response.status(401).send({ message: "Enter valid Email-addresss 😮" });
  else {
    const checkemailfromDB = await checkEmailIdfromDb(email);
    if (checkemailfromDB.length >= 1)
      response.status(401).send({
        message: "Email Id already Exists ! Try Another Email Address.😮",
      });
    else {
      const checkUsername = await checkUsernamefromDB(username, email);
      console.log(checkUsername);
      if (checkUsername.length >= 1) {
        response.status(401).send({
          message: "Username Already Exists ! Try with Different Username 😊",
        });
      } else {
        const hashedPassword = await getHashedPassword(password);
        const newUser = await newSignup(username, hashedPassword, email);
        newUser
          ? response.send({ message: "Successfully Signed up" })
          : response
              .status(404)
              .send({ message: "Failed to do Sign up !!! Try Again !!" });
      }
    }
  }
});

//Signin Operations
router.post("/signin", async (request, response) => {
  const { username, password } = request.body;
  const checkUsernamefromDB = await newSignin(username);
  if (checkUsernamefromDB.length < 1)
    response.status(401).send({ message: "User Name Doesn't Exists. 😮" });
  else {
    const storedPasswordfromDB = checkUsernamefromDB.password;
    const isPasswordValid = await bcrypt.compare(
      password,
      storedPasswordfromDB
    );
    if (!isPasswordValid)
      response.status(401).send({ message: "Invalid Credentials " });
    else {
      const token = jwt.sign(
        { _id: checkUsernamefromDB._id },
        process.env.SECRET_KEY
      );
      response.send({
        message: "Login success",
        token,
        email: checkUsernamefromDB.email,
      });
    }
  }
});

//Forgot Password Linking
router.post("/forgotpassword", async (request, response) => {
  const { email } = request.body;
  if (email == null)
    response.status(401).send({ message: "Enter Valid Email Address 😮" });
  else {
    const checkEmailIdfromDb = await getUserbyEmail(email);
    console.log(checkEmailIdfromDb);
    if (checkEmailIdfromDb.length == 0 || checkEmailIdfromDb.length > 1)
      response
        .status(401)
        .send({ message: "Email Address doesnt exist. Try Again. 😮" });
    else {
      // console.log(Randomstring.generate(options));

      const random = Randomstring.generate(options);
      const updateOTPinDB = await updateOTPinDb(email, random);

      //This Nodemailer has some error issue with Gmail accounts
      //For Demo Purpose only
      console.log(updateOTPinDB);
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "Gmail",
        auth: {
          user: "",
          pass: "",
        },
      });
      const mailOptions = {
        from: "sathiyaharris@gmail.com",
        to: `${email}`,
        Subject: "Your One Time Password is",
        Body: `<p>${random}</p>`,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
      response.send({ message: "OTP sent to the Registered Email" });
    }
  }
});

//verification
router.post("/verification", async (request, response) => {
  const { codeword } = request.body;
  const checkCodewordfromDB = await checkOTPinDB(codeword);
  if (checkCodewordfromDB.length != 1)
    response.status(401).send({ message: "Invalid Credentials " });
  else {
    response.status(200).send({ message: "Pass Code matched Successfully" });
  }
});

//change Password
router.post("/changepassword", async (request, response) => {
  const { username, NewPassword } = request.body;

  if (NewPassword == null)
    response.status(401).send({ message: "Enter valid password" });
  else {
    const newHashedPassword = await getHashedPassword(NewPassword);
    const updatedUserdetail = await changePasswordinDB(
      username,
      newHashedPassword
    );
    updatedUserdetail
      ? response.send({ message: "Password Reset Successfully !!!" })
      : response.status(401).send({ message: "Failed to Update Password" });
  }
});

export default router;
