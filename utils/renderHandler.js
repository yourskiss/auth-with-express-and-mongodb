import { type } from "os";

export const returnRegister = ({ res, status, view, success, error, data }) => {
  res.status(status).render(`userview/${view}`, {
    success, 
    error, 
    data
  });
};
export const returnVR = ({ res, status, view, success, info, error, data }) => {
  res.status(status).render(`userview/${view}`, {
    success, 
    info,
    error, 
    data
  });
};


export const returnLogin = ({ res, status, view, success, error, data }) => {
  res.status(status).render(`userview/${view}`, {
    success, 
    error, 
    data
  });
};

export const returnPF = ({ res, status, view, success, error, email }) => {
  res.status(status).render(`userview/${view}`, {
    success, 
    error, 
    email
  });
};

export const returnPasswordOTP = ({ res, status, view, success, info, error, email }) => {
  res.status(status).render(`userview/${view}`, {
    success, 
    info,
    error, 
    email
  });
};

export const returnPR= ({ res, status, view, success, info, error, data }) => {
  res.status(status).render(`userview/${view}`, {
    success, 
    info,
    error, 
    data
  });
};

 



export const returnList = ({ res, status,  view, error, result, currentPage, totalPages, sortBy, order, role,  countrecord }) => {
  res.status(status).render(`userview/${view}`, {
    error,
    status,
    result,
    currentPage,
    totalPages,
    sortBy,
    order,
    role,
    countrecord
  });
};


export const returnDetails = ({ res, status, view, error, result, querydata }) => {
    res.status(status).render(`userview/${view}`, {
    error,
    result,
    querydata
  });
};
 
 

export const returnAdd = ({ res, status, view, success, error, data }) => {
    res.status(status).render(`userview/${view}`, {
    success,
    error,
    data
  });
};
 

export const returnUpdate = ({ res, status, view, success, error, result, querydata }) => {
    res.status(status).render(`userview/${view}`, {
    success,
    error,
    result,
    querydata
  });
};

export const returnChangePassword = ({ res, status, view, success, error, data }) => {
    res.status(status).render(`userview/${view}`, {
    success,
    error,
    data
  });
};

 
export const returnDashboard = ({ res, status, view, userSession, error, data }) => {
    res.status(status).render(`userview/${view}`, {
    userSession,
    error,
    data
  });
};
