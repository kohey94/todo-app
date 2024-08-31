// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 環境変数読み込み
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
}));

// MongoDB接続
const connectDB = async () => {
  // TODO ここで環境変数からローカル用DBとテスト用DBの接続URI切り替えてるけど、この記述が適切かはわからん
  // プロダクションコードにテスト用に関する記述があるのがキモいから
  // テストコード側にテスト用DBの接続書いたほうがわかりやすい気がしてるから
  // でもどうすればいいのかわかんないので一旦このまま
  const dbUri = process.env.NODE_ENV === 'test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(dbUri);
  }
};
connectDB();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("connected to MongoDB");
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);


// TODO ここもローカル実行とテストでポート競合しないようにしているけどこれが適切化はわからん
let server;

// サーバー起動
const startServer = (port) => {
  const PORT = port || process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`サーバー起動中 port ${PORT}`);
  });
  return server;
}

// サーバー停止
const stopServer = () => {
  if (server) {
    server.close(() => {
      console.log('サーバー停止中');
    });
  }
};

// この部分を変更
if (!module.parent) {
  const PORT = process.env.PORT || 5000;
  startServer(PORT);
}

module.exports = { app, startServer, stopServer };