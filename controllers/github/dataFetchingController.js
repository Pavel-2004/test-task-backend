const {buildFilterQuery, buildSortQuery, getPaginationParams} = require("../../helpers/database/agGridQueryHelpers");
const Organization = require("../../models/organization");
const GitHubIntegration = require("../../models/GitHubIntegration");
const Repository = require("../../models/Repository");
const Commit = require("../../models/Commit");
const PullRequest = require("../../models/PullRequest");
const Issue = require("../../models/Issue");
const ChangeLog = require("../../models/ChangeLog");
const User = require("../../models/User");

const fetchOrganizations = async (req, res) => {
  try {
    const { startRow = 0, endRow = 0, sortModel, filterModel } = req.query;

    const gitHubIntegration = await GitHubIntegration.findOne()

    if (!gitHubIntegration) {
      return res.status(404).json({
        success: false,
        message: "GitHub Integration not found"
      });
    }

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.gitHubIntegration = gitHubIntegration._id

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);

    const { skip, limit } = getPaginationParams(startRow, endRow);

    const organizations = await Organization.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)

    const totalRecords = await Organization.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: organizations,
      totalRecords
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching organizations',
      error: error.message
    });
  }
}

const fetchRepositories = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, organizationId } = req.query;
    const gitHubIntegration = await GitHubIntegration.findOne()

    if (!gitHubIntegration) {
      return res.status(404).json({
        success: false,
        message: "GitHub Integration not found"
      });
    }

    const organization = await Organization.findOne({
      _id: organizationId,
      gitHubIntegration: gitHubIntegration._id
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or does not belong to the provided GitHub integration'
      });
    }

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.organization = organization._id;

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const repositories = await Repository.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await Repository.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: repositories,
      totalRecords
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching repositories',
      error: error.message
    });
  }
}

const fetchCommits = async (req, res) => {
  try {
    const { startRow, endRow, sortModel, filterModel, repositoryId, globalSearch } = req.query;


    const gitHubIntegration = await GitHubIntegration.findOne();
    if (!gitHubIntegration) {
      return res.status(404).json({
        success: false,
        message: 'GitHub integration not found'
      });
    }

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const organization = await Organization.findOne({
      _id: repository.organization,
      gitHubIntegration: gitHubIntegration._id
    })

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Repository does not belong to an organization or user does not have access to organization'
      });
    }

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.repository = repository._id;

    if (globalSearch) {
      query.$text = { $search: globalSearch  }
    }

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const commits = await Commit.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await Commit.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: commits,
      totalRecords
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching commits',
      error: error.message
    });
  }
}

const fetchChangeLogs = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, repositoryId, globalSearch } = req.query;

    const gitHubIntegration = await GitHubIntegration.findOne();
    if (!gitHubIntegration) {
      return res.status(404).json({
        success: false,
        message: 'GitHub integration not found'
      });
    }

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const organization = await Organization.findOne({
      _id: repository.organization,
      gitHubIntegration: gitHubIntegration._id
    })

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Repository does not belong to an organization or user does not have access to organization'
      });
    }

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.repository = repository._id;

    if (globalSearch) {
      query.$text = { $search: globalSearch  }
    }

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const changeLogs = await ChangeLog.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await ChangeLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: changeLogs,
      totalRecords
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching change logs',
      error: error.message
    });
  }
}

const fetchPullRequests = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, repositoryId, globalSearch } = req.query;

    const gitHubIntegration = await GitHubIntegration.findOne();
    if (!gitHubIntegration) {
      return res.status(404).json({
        success: false,
        message: 'GitHub integration not found'
      });
    }

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const organization = await Organization.findOne({
      _id: repository.organization,
      gitHubIntegration: gitHubIntegration._id
    })

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Repository does not belong to an organization or user does not have access to organization'
      });
    }

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.repository = repository._id;

    if (globalSearch) {
      query.$text = { $search: globalSearch  }
    }

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const pullRequests = await PullRequest.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await PullRequest.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: pullRequests,
      totalRecords
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching pull requests',
      error: error.message
    });
  }
}

const fetchIssues = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, repositoryId, globalSearch } = req.query;

    const gitHubIntegration = await GitHubIntegration.findOne();
    if (!gitHubIntegration) {
      return res.status(404).json({
        success: false,
        message: 'GitHub integration not found'
      });
    }

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const organization = await Organization.findOne({
      _id: repository.organization,
      gitHubIntegration: gitHubIntegration._id
    })

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Repository does not belong to an organization or user does not have access to organization'
      });
    }

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.repository = repository._id;

    if (globalSearch) {
      query.$text = { $search: globalSearch  }
    }

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const issues = await Issue.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await Issue.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: issues,
      totalRecords
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
}

const fetchUsers = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, organizationId } = req.query;
    const gitHubIntegration = await GitHubIntegration.findOne()

    if (!gitHubIntegration) {
      return res.status(404).json({
        success: false,
        message: "GitHub Integration not found"
      });
    }

    const organization = await Organization.findOne({
      _id: organizationId,
      gitHubIntegration: gitHubIntegration._id
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or does not belong to the provided GitHub integration'
      });
    }

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.organization = organization._id;

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const users = await User.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: users,
      totalRecords
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching repositories',
      error: error.message
    });
  }
}

module.exports = {
  fetchOrganizations,
  fetchRepositories,
  fetchCommits,
  fetchPullRequests,
  fetchIssues,
  fetchUsers,
  fetchChangeLogs
}