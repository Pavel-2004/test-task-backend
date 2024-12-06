const mongoose = require('mongoose');

const RepositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    unique: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  private: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
});

const Repository = mongoose.models.Repository || mongoose.model('Repository', RepositorySchema);

module.exports = Repository;
