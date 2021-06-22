const express = require('express');
const mongoose = require('mongoose');
// const path = require('path');
// const bodyParser = require('body-parser');

const { MONGO_URL, NOT_FOUND } = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// app.use(express,static(path.join(__dirname, 'public')));
// app.use(routes);

app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use((req, res, next) => {
  req.user = {
    _id: '60d0452f0271560148c6696b',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

// Handling 404
app.use((req, res) => res.status(NOT_FOUND).send({ message: 'Такой страницы не существует' }));

app.listen(PORT);
