export const rollQuery = (role, isDeleted) => {
  let query = { isDeleted };

  if (role === 'admin') {
    query.role = { $nin: ['superadmin', 'admin'] };
  }
  if (role === 'superadmin') {
    query.role = { $nin: ['superadmin', 'user'] };
  } 

  return query;
};