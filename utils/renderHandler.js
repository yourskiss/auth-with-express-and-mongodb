export const renderUserList = ({ res, status,  view = 'list', error, result = [], page = 1, totalPages = 1, sortBy, order }) => {
  res.render(`userview/${view}`, {
    error,
    status,
    result,
    currentPage: page,
    totalPages,
    sortBy,
    order
  });
};


// return renderUserList({ res, status, view: 'list-hide', error: "No record found", result, page, totalPages, sortBy, order });
