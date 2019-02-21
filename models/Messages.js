const mongoose = require('mongoose');
const Filter = require('bad-words');

const filter = new Filter();

const messageSchema = mongoose.Schema({
  displayName: {
    type: String,
  },
  message: {
    type: String,
    min: 1,
    max: [140, 'This message is too long'],
    required: true,
    validate: {
      // check if profane
      validator: message => !filter.isProfane(message),
      message: props => `${props.value} has profanity!`,
    },
  },
});

const Messages = mongoose.model('Messages', messageSchema);

module.exports = Messages;
