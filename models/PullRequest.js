const mongoose = require('mongoose');

const PullRequestSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  number: {
    type: Number,
    required: true,
  },
  body: {
    type: String,
    required: false
  },
  user: {
    type: String,
  },
  state: {
    type: String,
    enum: ['open', 'closed'],
    required: true,
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
});

PullRequestSchema.index({ 
  title: 'text', 
  number: 'text', 
  body: 'text',
  user: 'text',
  state: 'text'
});

const PullRequest = mongoose.models.PullRequest || mongoose.model('PullRequest', PullRequestSchema);

module.exports = PullRequest;
