const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');

const { OK } = require('../utils/constants');

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) throw new NotFoundError('Юзер с таким имейлом отсутствует');
      {
        const token = jwt.sign(
          { _id: user._id }, // пейлоуд токена
          'key',
          { expiresIn: '7d' },
        );

        res.cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
          .end();
      }
    })
    .catch(next);
};

// Получить список пользователей
const getUsers = (req, res, next) => User.find({})
  .then((users) => res.status(OK).send(users))
  .catch(next);

// Получить пользователя по id
const getAnyUser = (req, res, next) => {
  const { userId } = req.params;

  return User.findById(userId)
    .then((user) => {
      if (user) res.status(OK).send(user);
      throw new NotFoundError('Пользователь с указанным _id не найден');
    })
    .catch(next);
};

// Перейти на страницу заркгистрированного пользователя
const getUser = (req, res, next) => User.findById(req.user._id)
  .then((user) => res.status(OK).send({ user }))
  .catch(next);

// Создать нового пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))

    .then((user) => res.status(OK).send({ user }))
    .catch(next);
};

// Изменить информацию о пользователе
const updateUser = (req, res, next) => {
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
    .catch(next);
};

// Изменить аватар пользователя
const updateUserAvatar = (req, res, next) => {
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
    .catch(next);
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
