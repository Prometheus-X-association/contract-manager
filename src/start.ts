import { config } from 'config/config';
import app from 'server';

app.startServer().then((server) => {
  console.log('Server created.');
  server.listen(config.server.port, () =>
    console.log(`Server is running on port ${config.server.port}.`),
  );
});
