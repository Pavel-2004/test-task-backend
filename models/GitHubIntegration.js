const mongoose = require('mongoose');

const GithubIntegrationSchema = new mongoose.Schema({
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

const GitHubIntegration = mongoose.models.GitHubIntegration || mongoose.model('GitHubIntegration', GithubIntegrationSchema);

module.exports = GitHubIntegration;