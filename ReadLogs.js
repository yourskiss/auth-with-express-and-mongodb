
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const reportLogs = async (req, res) => {
  const role = req.session?.user?.role;
  if (!req.session?.user && !['admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const date = req.query.date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logsDir = path.join(__dirname, './logs');
  const logFilePath = path.join(logsDir, `app-${date}.log`);

  try {
    // ✅ Get list of log files in the directory
    const files = fs.readdirSync(logsDir);

    // ✅ Extract dates from filenames like app-YYYY-MM-DD.log
    const availableDates = files
      .filter(file => file.startsWith('app-') && file.endsWith('.log'))
      .map(file => file.replace('app-', '').replace('.log', ''))
      .sort((a, b) => b.localeCompare(a)); // ascending order

    // ✅ Read the selected log file
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
      })
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

    // ✅ Pass to the view
    res.render('logs/report-logs', { date, logs , availableDates});

  } catch (err) {
    res.status(500).render('error', {
      message: 'Could not read log file',
      details: err.message
    });
  }
};

 


export const downloadLogs = async (req, res) => {
  const role = req.session?.user?.role;
  if (!req.session?.user && !['admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

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
    const headers = ['timestamp', 'level', 'message', 'requestId', 'userId', 'role', 'isAuthenticated', 'endpoint', 'method', 'ip', 'device','platform','os','browser','browserVersion'];
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

