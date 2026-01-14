import { config } from 'dotenv';
config();

import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Admin API listening on port ${PORT}`);
});
