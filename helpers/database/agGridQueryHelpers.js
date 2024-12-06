const buildFilterQuery = (filterModel) => {
  let query = {};

  if (filterModel) {
    Object.keys(filterModel).forEach(field => {
      const { filter, type } = filterModel[field];
      switch (type) {
        case 'contains':
          query[field] = { $regex: filter, $options: 'i' };
          break;
        case 'equals':
          query[field] = filter;
          break;
        case 'startsWith':
          query[field] = { $regex: `^${filter}`, $options: 'i' };
          break;
      }
    });
  }

  return query;
};

const buildSortQuery = (sortModel) => {
  let sortQuery = {};

  if (sortModel && sortModel.length > 0) {
    sortModel.forEach(({ colId, sort }) => {
      sortQuery[colId] = sort === 'asc' ? 1 : -1;
    });
  }

  return sortQuery;
};

const getPaginationParams = (startRow, endRow) => {
  const skip = parseInt(startRow) || 0;
  const limit = (parseInt(endRow) || 10) - skip;
  return { skip, limit };
}; 


module.exports = {
  buildFilterQuery,
  buildSortQuery,
  getPaginationParams
}