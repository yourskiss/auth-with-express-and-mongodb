export const renderList = ({ res, status,  view, error, result, currentPage, totalPages, sortBy, order }) => {
  res.status(status).render(`userview/${view}`, {
    error,
    status,
    result,
    currentPage,
    totalPages,
    sortBy,
    order
  });
};
