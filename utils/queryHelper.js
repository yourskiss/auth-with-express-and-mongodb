const roleAccessRules = {
  superadmin: ['user', 'admin'], // can access users and admins
  admin: ['user'],               // can access only users
  user: []                       // no access to user list
};
export let buildUserQuery = (currentUser, requestedRole) => {
  let currentRole = currentUser.role;
  let currentUserId = currentUser._id;
  
  if (requestedRole === 'superadmin') { // not allowed to query superadmin
    throw new Error('Unauthorized access to superadmin');
  }
  if (currentRole === 'user') {
    return { _id: currentUserId }; // Only self
  }
  let allowedRoles = roleAccessRules[currentRole] || [];
  if (requestedRole) {
    if (!allowedRoles.includes(requestedRole)) {
      throw new Error(`Access denied for role: ${requestedRole}`);
    }
    return { role: requestedRole };
  }
  return { role: { $in: allowedRoles } };
};

