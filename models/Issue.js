const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  gitHubIssueNumber: {
    type: Number,
    required: true,
  },
  user: {
    login: String,
    avatarUrl: String 
  },
  gitHubIssueId: {
    type: String
  },
  body: {
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

IssueSchema.index({ 
  title: 'text', 
  number: 'text', 
  body: 'text',
  user: 'text',
  state: 'text'
});

const Issue = mongoose.models.Issue || mongoose.model('Issue', IssueSchema);

module.exports = Issue;
