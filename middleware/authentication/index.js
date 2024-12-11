const GitHubIntegration = require("../../models/GithubIntegration");

const authMiddleware = async (req, res, next) => {
  try {
    console.log('here here')
    const githubIntegration = await GitHubIntegration.findOne()

    if (!githubIntegration) {
      return res.status(401).json({
        success: false,
        error: 'GitHub Integration Not Configured',
        message: 'No GitHub integration found. Please set up GitHub integration first.'
      })
    }

    req.gitHubIntegration = githubIntegration._id
    next()
  }
  catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Authentication Error',
      message: 'Error checking GitHub integration'
  });
  }
}

module.exports = {
  authMiddleware
}