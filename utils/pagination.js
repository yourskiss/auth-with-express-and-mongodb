export const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order === 'desc' ? -1 : 1;
  
  const limit = parseInt(process.env.RECORD_LIMIT) || 10;
  const skip = (page - 1) * limit;

  return { page, sortBy, order, limit, skip, sort: { [sortBy]: order }  };
};
