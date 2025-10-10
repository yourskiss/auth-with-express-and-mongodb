import express from 'express';
const logRoutes = express.Router();
import { reportLogs, downloadLogs } from '../controllers/logController.js';

logRoutes.get('/', reportLogs);
logRoutes.get('/report', reportLogs);
logRoutes.get('/download', downloadLogs);

 
export default logRoutes;
