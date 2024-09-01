const app = require('./app')

const dotenv = require('dotenv');


const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path : envFile });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバー起動中 port: ${PORT} - 環境: ${process.env.NODE_ENV}`);
});