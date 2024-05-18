const Room = require(`${__dirname}/../Models/roomModel.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const appError = require(`${__dirname}/../utils/appError.js`);

exports.createRoom = catchAsync(async (req, res, next) => {
  const newRoom = await Room.create({
    roomName: req.body.roomName,
  });
  res.status(201).json({
    status: "Success",
    newRoom,
  });
});

exports.getRoom = catchAsync(async (req, res, next) => {
  const currentRoom = await Room.findOne({
    roomCode: req.body.roomCode,
  });
  if (!currentRoom) {
    return next(new appError("No Such Room Exist", 404));
  }
  res.status(201).json({
    status: "Success",
    currentRoom,
  });
});
