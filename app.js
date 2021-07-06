const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const helmet = require('helmet');
// const path = require('path');
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const auth = require('./middlewares/auth');
const handleErrors = require('./middlewares/handle-errors');
const NotFoundError = require('./errors/not-found-error');
const { MONGO_URL } = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());
app.use(cookieParser());

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// app.use(express,static(path.join(__dirname, 'public')));
// app.use(routes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use((err) => {
  if (err) throw new NotFoundError('Такой страницы не существует');
});

// мидлвэр для централизованной обработки ошибок
app.use(handleErrors);

app.listen(PORT);
