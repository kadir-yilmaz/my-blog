const http = require('http');
const path = require('path');
const NextServer = require('next/dist/server/next-server').default;

const requiredServerFiles = require('./.next/required-server-files.json');

process.env.NODE_ENV = 'production';
process.chdir(__dirname);

const nextServer = new NextServer({
  hostname: 'localhost',
  port: 3000,
  dir: __dirname,
  dev: false,
  customServer: false,
  conf: requiredServerFiles.config,
});

const requestHandler = nextServer.getRequestHandler();

const server = http.createServer(async (req, res) => {
  try {
    await requestHandler(req, res);
  } catch (err) {
    console.error('Unhandled request error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error: ' + (err && err.message ? err.message : String(err)));
    }
  }
});

// iisnode passes Windows Named Pipe (e.g. \\.\pipe\...) in process.env.PORT
const port = process.env.PORT || 3000;

server.listen(port, (err) => {
  if (err) {
    console.error('Failed to bind server on', port, err);
    process.exit(1);
  }
  console.log(`> Next.js production server listening on ${port}`);
});
