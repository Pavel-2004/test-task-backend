const mongoose = require('mongoose');

const ChangelogSchema = new mongoose.Schema({
  user: {
    login: String,
    avatarUrl: String 
  },
  gitHubIssueId: {
    type: String,
  },
  gitHubIssueNumber: {
    type: Number
  },
  event: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  }
});

ChangelogSchema.index({ 
  user: 'text', 
  name: 'text', 
  message: 'text',
});

const Changelog = mongoose.models.Changelog || mongoose.model('Changelog', ChangelogSchema);

module.exports = Changelog;