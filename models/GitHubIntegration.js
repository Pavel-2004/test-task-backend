const mongoose = require('mongoose');

const githubIntegrationSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: true, 
  },
  githubUsername: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

const GitHubIntegration = mongoose.models.GitHubIntegration || mongoose.model('GitHubIntegration', githubIntegrationSchema);

module.exports = GitHubIntegration;