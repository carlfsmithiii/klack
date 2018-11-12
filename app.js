const express = require("express");
const querystring = require("querystring");
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const path = require('path');
const app = express();
mongoose.Promise = global.Promise;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klack';


mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

const {
  Message
} = require('./models/message');
const {
  User
} = require('./models/user');

// List of all messages
let messages = [];

// Track last active times for each sender
let users = {};

app.use(express.static("./public"));
app.use(express.json());

// generic comparison function for case-insensitive alphabetic sorting on the name field
function userSortFn(a, b) {
  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  return 0;
}

app.get("/messages", (request, response) => {
  const now = Date.now();

  // consider users active if they have connected (GET or POST) in last 15 seconds
  const requireActiveSince = now - 15 * 1000;

  // users[request.query.for] = now;
  User.findOne({
    username: request.query.for
  }).then(user => {
    if (user) {
      user.lastActive = now;
      user.save();
    } else {
      user = new User({
        username: request.query.for,
        lastActive: now
      });
      user.save();
    }
  });

  Promise.all([User.find(), Message.find()]).then(([users, messages]) => {
    const otherUsers = users
      .filter(user => user.username != request.query.for)
      .map(user => {
        return {
          name: user.username,
          active: user.lastActive > requireActiveSince
        };
      });
    response.send({
      messages: messages.slice(-40),
      users: otherUsers
    });
  });
});

app.post("/messages", (request, response) => {
  const timestamp = Date.now();
  request.body.timestamp = timestamp;

  users[request.body.sender] = timestamp;

  User.findOne({
    username: request.body.sender
  }).then((user) => {
    if (!user) {
      user = new User({
        username: request.body.sender,
        lastActive: timestamp
      });
      user.save();
    } else {
      user.lastActive = timestamp;
      user.save();
    }
  });
  const message = new Message(request.body);
  message.save().then((doc) => response.status(201).send(doc));
});

app.listen(port);