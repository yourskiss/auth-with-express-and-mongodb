// utils/pagination.js
export const getPagination = (req) => {
  let allowedSortFields = ['createdAt', 'fullname'];
  let allowedOrder = ['asc', 'desc'];

  let role = req.query.role || 'user';
  let page = parseInt(req.query.page) || 1;
  let sortByRaw = req.query.sortBy || 'createdAt';
  let sortBy = allowedSortFields.includes(sortByRaw) ? sortByRaw : 'createdAt';

  let orderRaw = req.query.order || 'asc';
  let order = allowedOrder.includes(orderRaw) ? (orderRaw === 'desc' ? -1 : 1) : 1;

  let limit = parseInt(process.env.RECORD_LIMIT) || 10;
  let skip = (page - 1) * limit;

  return { role, page, sortBy, order, limit, skip, sort: { [sortBy]: order } };
};
