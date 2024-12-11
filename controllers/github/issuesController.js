const {buildFilterQuery, buildSortQuery, getPaginationParams} = require("../../helpers/database/agGridQueryHelpers");
const Issue = require("../../models/Issue");
const Repository = require("../../models/Repository");
const User = require("../../models/User")

const fetchIssues = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, globalSearch, repositoryId, userId } = req.query;

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    
    if (repositoryId) {
      const repository = await Repository.findById(repositoryId);

      query.repository = repository._id;
    }

    if (userId) {
      const user = await User.findById(userId)
      
      query["user.login"] = user.login
    }

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
      totalRecords,
      schema: Issue.schema
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

const fetchIssue = async (req, res) => {
  const { id } = req.params

  try {
    const issue = await Issue.findById(id)

    return res.status(200).json({
      success: true, 
      issue
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false, 
      message: 'Error fetching issue',
      error: error.message
    })
  }
}

module.exports = {
  fetchIssues,
  fetchIssue
}