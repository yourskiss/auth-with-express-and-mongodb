

 
const ROLE_TYPES = process.env.ROLE_TYPES || '';
const ROLE_PERMISSIONS = process.env.ROLE_PERMISSIONS || '';

// Parse role types
const rolesTypes = ROLE_TYPES.split(',').map(role => role.trim());

// Parse role permissions
const rolesPermissions = {};
ROLE_PERMISSIONS.split('&').forEach(entry => {
  const [role, perms] = entry.split(':');
  if (role && perms) {
    rolesPermissions[role.trim()] = perms.split(',').map(p => p.trim());
  }
});

// Optional: helper function
function getPermissionsForRole(role) {
  return rolesPermissions[role] || [];
}

export { rolesTypes, rolesPermissions, getPermissionsForRole };
