export const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/users/dashboard');
  }
  next();
};

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/users/login');
};


export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).send('Forbidden: Insufficient Permissions');
    }
    next();
  };
};