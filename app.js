const express = require('express');
const mongoose = require('mongoose');
// const path = require('path');
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {errors} = require('celebrate');
const auth = require('./middlewares/auth');

const { MONGO_URL, NOT_FOUND } = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();

app.use(cookieParser());
app.use(errors());
// app.get('/users', (req, res) => {
//   console.log(req.cookies.jwt); // достаём токен
// });

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

// мидлвэр для централизованной обработки ошибок
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

// Handling 404
app.use((req, res) => res.status(NOT_FOUND).send({ message: 'Такой страницы не существует' }));

app.listen(PORT);
