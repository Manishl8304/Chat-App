const appError = require(`${__dirname}/../utils/appError.js`);
const Users = require(`${__dirname}/../Models/userModel.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);

exports.sendRequest = catchAsync(async (req, res, next) => {
  const result = await Users.findOne({
    userEmail: req.body.userEmail,
  });
  if (!result) {
    return new appError("UserName doesn't exists", 404);
  } else {
    var newArr = result.pendingRequests;
    if (newArr.includes(req.user.userName)) {
      res.status(200).json({
        status: "success",
        message: "Request was sent Succesfully! no need to send again",
      });
      return;
    }
    newArr.push(req.user.userName);
 
    await Users.updateOne(
      { userEmail: req.body.userEmail },
      {
        $set: {
          pendingRequests: newArr,
        },
      }
    );
    res.status(200).json({
      status: "success",
      message: "Request has been sent Succesfully",
    });
  }
});

exports.getFriendRequests = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    user: req.user.pendingRequests,
  });
});

exports.getListOfFriends = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    user: req.user.listOfFriends,
  });
});
exports.addAFriend = catchAsync(async (req, res, next) => {
  await Users.updateOne(
    { userName: req.body.requestName },
    {
      $addToSet: {
        listOfFriends: req.user.userName,
      },
    }
  );
  await Users.updateOne(
    { userEmail: req.user.userEmail },
    {
      $addToSet: {
        listOfFriends: req.body.requestName,
      },
    }
  );
  await Users.updateOne(
    { userEmail: req.user.userEmail },
    {
      $pull: {
        pendingRequests: req.body.requestName,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});
exports.deleteAFriend = catchAsync(async (req, res, next) => {
  var newArr = req.user.pendingRequests;
  const index = newArr.indexOf(req.body.requestName);
  const x = newArr.splice(index, 1);
  await Users.updateOne(
    { userEmail: req.user.userEmail },
    {
      $set: {
        pendingRequests: newArr,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});
