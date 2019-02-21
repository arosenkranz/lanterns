const db = require('../models');
const promiseHandler = require('../utils/promiseHandler');

module.exports = {
  async findAll(req, res) {
    const [err, dbUsers] = await promiseHandler(db.Users.findAll().populate('messsages'));

    if (err) {
      console.log(err);
      return res.json(err);
    }
    res.json(dbUsers);
  },
  async findUser(req, res) {
    const [err, dbUser] = await promiseHandler(
      db.Users.findAll({ user_id: req.user.user_id }).populate('messsages'),
    );

    if (err) {
      console.log(err);
      return res.json(err);
    }
    res.json(dbUser);
  },
  async create(req, res) {
    // get io
    const io = req.app.get('socketio');

    const [messageErr, dbMessage] = await promiseHandler(db.Messages.create(req.body));

    if (messageErr) {
      console.log(messageErr);
      return res.json(messageErr);
    }

    console.log(dbMessage);

    const [userErr, dbUser] = await promiseHandler(
      db.Users.findOneAndUpdate(
        { user_id: req.user.user_id },
        { $push: { messages: dbMessage._id } },
        { new: true },
      ),
    );

    if (userErr) {
      console.log(userErr);
      return res.json(userErr);
    }

    console.log(dbUser);

    io.emit('new lantern', { ...dbMessage, ...dbUser });
    res.json({ ...dbMessage, ...dbUser });
  },
};
