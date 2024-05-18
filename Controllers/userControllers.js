const Users = require(`${__dirname}/../Models/userModel.js`);
const usersVerification = require(`${__dirname}/../Models/userVerificationModel.js`);
const appError = require(`${__dirname}/../utils/appError.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const sendEmail = require(`${__dirname}/../utils/sendEmail.js`);
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const sign = (id) => {
  return JWT.sign({ id }, `${process.env.JWT_SECRET}`, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, res) => {
  const token = sign(user._id);
  const cookieOptions = {
    expire: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(200).json({
    status: "success",
    user,
    token,
  });
};

exports.getAUser = catchAsync(async (req, res, next) => {
  const cuser = await Users.find({ _id: req.params.id });
  res.status(200).json({
    status: "Success",
    cuser,
  });
});

exports.verify = catchAsync(async (req, res, next) => {
  let { userId, uniqueString } = req.params;
  const cuser = await usersVerification.find({ userId });
  if (
    cuser.length > 0 &&
    cuser[0].expiresAt > Date.now() &&
    (await bcrypt.compare(uniqueString, cuser[0].uniqueString))
  ) {
    await Users.updateOne({ _id: userId }, { verified: true });
    await usersVerification.deleteOne({ userId });
    res.status(200).json({
      Status: "Verified",
    });
  } else {
    await Users.deleteOne({ _id: userId });
    res.status(400).json({
      Status: "Verification Failed",
    });
  }
});

exports.signup = catchAsync(async (req, res, next) => {
  const check1 = await Users.find({
    $and: [{ userEmail: req.body.userEmail }, { verified: true }],
  });
  if (check1.length > 0)
    return next(new appError("This email is already registered", 400));

  const check2 = await Users.find({ userEmail: req.body.userEmail });
  if (check2.length > 0) {
    await Users.deleteOne({ userEmail: req.body.userEmail });
  }

  const check3 = await Users.find({ userName: req.body.userName });
  if (check3.length > 0)
    return next(new appError("This userName already exist", 400));

  const newUser = await Users.create({
    userName: req.body.userName,
    userEmail: req.body.userEmail,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    verified: false,
  });
  try {
    await sendVerificationEmail(newUser, req, res);
    res.status(201).json({
      Status: "Pending",
      Message: "Verification email has been sent",
      newUser,
    });
  } catch (err) {
    await Users.deleteOne({ _id: newUser._id });
  }
});

const sendVerificationEmail = async (newUser, req, res) => {
  const check1 = await usersVerification.find({ userName: newUser.userName });
  if (check1) {
    await usersVerification.deleteOne({ userName: newUser.userName });
  }
  const currentUrl = `${req.protocol}://${req.get("host")}`;
  const uniqueString = uuidv4();
  const hashedString = await bcrypt.hash(uniqueString, 10);
  const newToken = await usersVerification.create({
    userId: newUser._id,
    userName: newUser.userName,
    uniqueString: hashedString,
    createdAt: Date.now(),
    expiresAt: Date.now() + 21600000,
  });
  await sendEmail({
    to: newUser.userEmail,
    subject: "Verify Your Email",
    text: `Open this to verify. ${
      currentUrl + "users/verify/" + newUser._id + "/" + uniqueString
    }`,
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { userEmail, password } = req.body;
  if (!userEmail || !password) {
    return next(new appError("please provide email and password", 400));
  }

  const cuser = await Users.findOne({ userEmail });
  if (!cuser) {
    return next(
      new appError(
        "provided email doesn't exist in database please sign up first",
        400
      )
    );
  }

  if (!cuser.verified) {
    return next(new appError("Please verify first", 400));
  }
  if (!(await bcrypt.compare(password, cuser.password))) {
    return next(new appError("Wrong password", 400));
  }
  createSendToken(cuser, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;
  if (!token) {
    return next(
      new appError("You are not logged in, Please logged in first!", 401)
    );
  }
  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  const currentUser = await Users.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError("User belonging to token doesn't exist anymore"),
      401
    );
  }
  req.user = currentUser;
  next();
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "");
  res.status(204).json({
    status: "success",
  });
});
