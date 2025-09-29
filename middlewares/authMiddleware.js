
 
// 🛑 Middleware for unauthenticated users only (guests)
export const isGuest = (req, res, next) => {
  if (req.session?.user) {
    return res.redirect('/users/dashboard');
  }
  next();
};

// ✅ Middleware for authenticated users only
export const isAuthenticated = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect('/users/login');
  }
  next();
};



// ✅ Middleware for check user role
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).send('Forbidden: Insufficient Permissions');
    }
    next();
  };
};


