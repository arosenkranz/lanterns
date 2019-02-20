const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  // email: {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   validate: {
  //     // check if email follows string@string.string format
  //     validator: email => (/\S+@\S+\.\S+/.test(email)),
  //     message: props => `${props.value} is not an email!`,
  //   },
  // },
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Messages',
    },
  ],
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
