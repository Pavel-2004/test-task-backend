const {buildFilterQuery, buildSortQuery, getPaginationParams} = require("../../helpers/database/agGridQueryHelpers");
const Repository = require("../../models/Repository");
const GitHubIntegration = require("../../models/GitHubIntegration");
const Organization = require("../../models/organization");

const fetchRepositories = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, organizationId } = req.query;
    const { gitHubIntegration } = req

    const organization = await Organization.findOne({
      _id: organizationId,
      gitHubIntegration: gitHubIntegration._id
    });

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

const fetchRepository = async (req, res) => {
  const { id } = req.params

  try {
    const repository = await Repository.findById(id)

    return res.status(200).json({
      success: true,
      repository
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching repository',
      error: error.message
    })
  }

}

module.exports = {
  fetchRepositories,
  fetchRepository
}