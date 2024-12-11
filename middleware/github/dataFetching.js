const Organization = require("../../models/Organization")
const Repository = require("../../models/Repository")
const Issue = require("../../models/Issue")
const User = require("../../models/User")

const validateOrganizationRequestMiddleware = async (req, res, next) => {
  const { organizationId } = req.query
  const { gitHubIntegration } = req


  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: 'Organizion Id is required'
    })
  }

  if (!gitHubIntegration) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Request"
    })
  }

  try {
    const organization = await Organization.findOne({
      _id: organizationId,
      gitHubIntegration
    })

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or does not belong to the provided GitHub integration'
      });
    }

    next()
  }
  catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Request Validation Error',
      message: error.message
    });
  }
}

const validateIssueRequestMiddleware = async (req, res, next) => {
  const { issueId } = req.query
  const { gitHubIntegration } = req

  if (!issueId) {
    return res.status(400).json({
      success: false,
      message: 'Issue Id is required'
    })
  }

  if (!gitHubIntegration) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Request"
    })
  }

  try {
    const issue = await Issue.findById(issueId)

    if (!issue) {
      return res.status(404).json({
        success: false, 
        message: 'Github issue not found'
      })
    }

    const repository = await Repository.findById(issue.repository);

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository for issue not found'
      });
    }

    const organization = await Organization.findOne({
      _id: repository.organization,
      gitHubIntegration
    })

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or does not belong to the provided GitHub integration'
      });
    }

    next()
  }
  catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Request Validation Error',
      message: error.message
    });
  }
}

const validateRepositoryOrUserRequestMiddleware = async (req, res, next) => {
  const { repositoryId, userId } = req.query
  const { gitHubIntegration } = req

  if (!(repositoryId || userId)) {
    return res.status(400).json({
      success: false,
      message: 'Repository Id or User Id is required'
    })
  }

  if (!gitHubIntegration) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Request"
    })
  }

  try {
    if (userId) {
      const user = await User.findById(userId)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        })
      }

      const organization = await Organization.findOne({
        _id: user.organization, 
        gitHubIntegration
      })

      if (!organization) {
        return res.status(404).json({
          success: false, 
          message: "Repository's organization not Organization not found or does not belong to the provided GitHub integration"
        })
      }
    }

    if (repositoryId) {
      const repository = await Repository.findById(repositoryId)

      if (!repository) {
        return res.status(404).json({
          success: false,
          message: "Repository not found"
        })
      }

      const organization = await Organization.findOne({
        _id: repository.organization, 
        gitHubIntegration
      })

      if (!organization) {
        return res.status(404).json({
          success: false, 
          message: "Repository's organization not Organization not found or does not belong to the provided GitHub integration"
        })
      }
    }

    next()
  }
  catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Request Validation Error',
      message: error.message
    });
  }
}

module.exports = {
  validateIssueRequestMiddleware,
  validateOrganizationRequestMiddleware,
  validateRepositoryOrUserRequestMiddleware
}