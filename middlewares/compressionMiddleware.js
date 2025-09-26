import compression from 'compression';

const compressionMiddleware = compression({
  level: 6,              // Compression level (0–9)
  threshold: 1024,       // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false; // Skip compression if this custom header is present
    }
    return compression.filter(req, res);
  }
});

export default compressionMiddleware;
