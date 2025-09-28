
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

 
//   const role = req.session?.user?.role;
//   if (!['admin', 'superadmin'].includes(role)) {
//     return res.status(403).json({ error: 'Access denied' });
//   }
  
export const listLogs = (req, res) => {
  const logDir = path.join(__dirname, './logs');

  fs.readdir(logDir, (err, files) => {
    if (err) {
      return res.status(500).render('error', { message: 'Unable to read log directory' });
    }

    const dates = files
      .filter(f => f.startsWith('app-') && f.endsWith('.log'))
      .map(f => f.replace('app-', '').replace('.log', ''))
      .sort((a, b) => new Date(b) - new Date(a)); // most recent first

    res.render('logs/list', { availableDates: dates });
  });
};



export const readLogs = async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logFilePath = path.join(__dirname, `./logs/app-${date}.log`);
  console.log("logFilePath-", logFilePath);

  try {
    const logData = fs.readFileSync(logFilePath, 'utf8');
    
    const logs = logData
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(', ');
        if (parts.length < 4) return { raw: line };

        const timestamp = parts[0];
        const level = parts[1];
        const message = parts[2];
        const metaRaw = parts.slice(3).join(', ');  

        let metadata = {};
        try {
          metadata = JSON.parse(metaRaw);
        } catch (e) {
          metadata = { rawMeta: metaRaw };
        }

        return { timestamp, level, message, ...metadata };
      });
    res.render('logs/detail', { date, logs });
  } catch (err) {
    res.status(500).render('error', {
      message: 'Could not read log file',
      details: err.message
    });
  }
};
 



 export const downloadLogs2 = async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10); // Default to today
  const file = path.join(__dirname, `./logs/app-${date}.log`);
  console.log("file-", file)

  // Check if file exists first
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: `Log file for ${date} not found.` });
  }

  res.download(file, `log-${date}.log`, (err) => {
    if (err) {
      console.error('Error sending log file:', err.message);
      res.status(500).json({ error: 'Failed to download log file', details: err.message });
    }
  });

  // Convert to CSV before sending
  const logs = JSON.parse(fs.readFileSync(file, 'utf8'));
  const csv = logs.map(log => `${log.timestamp},${log.level},${log.message}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="app-${date}.csv"`);
  res.send(csv);

};

 


export const downloadLogs = async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const logFilePath = path.join(__dirname, `./logs/app-${date}.log`);

  if (!fs.existsSync(logFilePath)) {
    return res.status(404).json({ error: `Log file for ${date} not found.` });
  }

  try {
    const logData = fs.readFileSync(logFilePath, 'utf8');
    const lines = logData.split('\n').filter(line => line.trim());

    const parsedLogs = lines.map(line => {
      const parts = line.split(', ');
      if (parts.length < 4) return null;

      const timestamp = parts[0];
      const level = parts[1];
      const message = parts[2];
      const metaRaw = parts.slice(3).join(', ');

      let metadata = {};
      try {
        metadata = JSON.parse(metaRaw);
      } catch (e) {
        metadata = { rawMeta: metaRaw };
      }

      return { timestamp, level, message, ...metadata };
    }).filter(Boolean);

    // Build CSV
    const headers = ['timestamp', 'level', 'message', 'userId', 'role', 'endpoint', 'method', 'ip', 'userAgent'];
    const csvRows = [headers.join(',')];

    parsedLogs.forEach(log => {
      const row = headers.map(h => `"${(log[h] || '').toString().replace(/"/g, '""')}"`).join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="log-${date}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to convert log to CSV', details: err.message });
  }
};

