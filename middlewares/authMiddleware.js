export const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/users/dashboard');
  }
  next();
};

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/users/login');
};

