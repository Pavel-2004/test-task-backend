const {buildFilterQuery, buildSortQuery, getPaginationParams} = require("../../helpers/database/agGridQueryHelpers");
const Organization = require("../../models/Organization");
const User = require("../../models/User")


const fetchUsers = async (req, res) => {
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

    const users = await User.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: users,
      totalRecords,
      schema: User.schema
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

const fetchUser = async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById(id)

    return res.status(200).json({
      success: true, 
      user
    })
  }
  catch (error) {
    return res.status(500).json({
      success: false, 
      message: 'Error fetching user',
      error: error.message
    })
  }
}

module.exports = {
  fetchUsers,
  fetchUser
}