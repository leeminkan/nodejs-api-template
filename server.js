const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mySocket = require('./socket.js');

const myRouter = require('./routes/index');
const mongoose = require('mongoose');
const keys = require('./config/index');
const cors = require('cors')
const bodyParser = require('body-parser');
const { i18nInit } = require('./i18n');

mongoose.connect(keys.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => console.log(`Connected to database successfully ${keys.MONGO_URL}`))
  .catch(console.log)


const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: '*'
}));

i18nInit(app);

// Set static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//size
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));

app.use(function (req, res, next) {
  req.io = io;
  next();
});

//
app.use('/', express.static('./public'))

app.use('/api', myRouter); // localhost:5000/api



mySocket.socketAll(io)




const PORT = process.env.PORT || 9111;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
