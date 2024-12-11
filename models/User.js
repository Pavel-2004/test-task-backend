const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  avatarUrl: {
    type: String,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

module.exports = User