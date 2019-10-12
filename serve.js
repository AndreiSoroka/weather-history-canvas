const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: './dist',
    cleanUrls: true,
  });
});
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
