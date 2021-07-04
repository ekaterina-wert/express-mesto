const express = require('express');
const mongoose = require('mongoose');
// const path = require('path');
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const auth = require('./middlewares/auth');
const {
  MONGO_URL,
  BAD_REQUEST,
  NOT_FOUND,
  CONFLICT,
  SERVER_ERROR,
} = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();

app.use(cookieParser());

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

// роуты, не требующие авторизации
app.use('/', require('./routes/auth'));

// авторизация
app.use(auth);

// роуты, для которых нужна авторизации
app.use('/users', require('./routes/users'));

app.use('/cards', require('./routes/cards'));

// Обработка ошибок валидатора celebrate
app.use(errors());

// Handling 404
app.use((req, res) => res.status(NOT_FOUND).send({ message: 'Такой страницы не существует' }));

// мидлвэр для централизованной обработки ошибок

app.use((err, req, res, next) => {
  const { statusCode = SERVER_ERROR, message } = err;
  if (err.name === 'MongoError' && err.code === 11000) return res.status(CONFLICT).send({ message: 'Юзер с таким имейлом уже существует' });
  if (err.name === 'CastError') return res.status(BAD_REQUEST).send({ message: 'Передан некорректный id пользователя' });
  if (err.name === 'ValidationError') return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные' });

  res.status(statusCode).send({
    message: statusCode === SERVER_ERROR
      ? 'На сервере произошла ошибка'
      : message,
  });
  return next();
});

app.listen(PORT);
