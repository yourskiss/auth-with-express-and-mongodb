 
 

export const rollQuery = (isSuperAdmin, role, isDeleted) => {
  let query = {};

  if (typeof isDeleted === 'boolean') {
    query.isDeleted = isDeleted;
  }

  if (role) {
    if (role === 'admin' && !isSuperAdmin) {
      throw new Error('Unauthorized access to admin role');
    }
    query.role = role;
  } else {
    query.role = isSuperAdmin ? { $nin: ['superadmin'] } : { $nin: ['admin', 'superadmin'] };
  }

  return query;
};
