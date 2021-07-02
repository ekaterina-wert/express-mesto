const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const {
  OK, BAD_REQUEST, NOT_FOUND, SERVER_ERROR,
} = require('../utils/constants');

const sendError = (req, res, err) => {
  if (err.name === 'CastError') return res.status(BAD_REQUEST).send({ message: 'Передан некорректный id пользователя' });
  if (err.name === 'ValidationError') return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
  return res.status(SERVER_ERROR).send({ message: err.message });
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id }, //пейлоуд токена
        'key',
        { expiresIn: '7d' }
      );
      // if (!user) return Promise.reject(new Error('Юзер с таким имейлом отсутствует'));
      // res.send({token})

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .end();
    })
    .catch((err) => sendError(req, res, err));
};

// Получить список пользователей
const getUsers = (req, res) => User.find({})
  .then((users) => res.status(OK).send(users))
  .catch((err) => res.status(SERVER_ERROR).send({ message: err.message }));

// Получить пользователя по id
const getAnyUser = (req, res) => {
  const { userId } = req.params;

  return User.findById(userId)
    .then((user) => {
      if (user) res.status(OK).send(user);
      res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
    })
    .catch((err) => sendError(req, res, err));
};

// Перейти на страницу заркгистрированного пользователя
const getUser = (req, res) => {
  return User.findById(req.user._id)
    .then((user) => res.status(OK).send({ user }))
    .catch((err) => sendError(req, res, err));
};

// Создать нового пользователя
const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))

    .then((user) => res.status(OK).send({ user }))
    .catch((err) => sendError(req, res, err));
};

// Изменить информацию о пользователе
const updateUser = (req, res) => {
  const { name, about } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.status(OK).send({ user }))
    .catch((err) => sendError(req, res, err));
};

// Изменить аватар пользователя
const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.status(OK).send({ user }))
    .catch((err) => sendError(req, res, err));
};

module.exports = {
  login,
  getUsers,
  getAnyUser,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
};
