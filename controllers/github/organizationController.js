const {buildFilterQuery, buildSortQuery, getPaginationParams} = require("../../helpers/database/agGridQueryHelpers");
const GitHubIntegration = require("../../models/GithubIntegration");
const Organization = require("../../models/organization");

const fetchOrganizations = async (req, res) => {
  try {
    const { startRow = 0, endRow = 0, sortModel, filterModel } = req.query;
    const { gitHubIntegration } = req

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.gitHubIntegration = gitHubIntegration

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
      totalRecords,
      schema: Organization.schema
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

const fetchOrganization = async (req, res) => {
  const { id } = req.params

  try {
    const organization = await Organization.findById(id)

    return res.status(200).json({
      success: true,
      organization
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching organization',
      error: error.message
    })
  }
}

module.exports = {
  fetchOrganization,
  fetchOrganizations
}