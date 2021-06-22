const User = require('../models/user');
const {
  OK, BAD_REQUEST, NOT_FOUND, SERVER_ERROR,
} = require('../utils/constants');

const sendError = (req, res, err) => {
  if (err.name === 'CastError') return res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
  if (err.name === 'ValidationError') return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
  return res.status(SERVER_ERROR).send({ message: err.message });
};

// Получить список пользователей
const getUsers = (req, res) => User.find({})
  .then((users) => res.status(OK).send(users))
  .catch((err) => res.status(SERVER_ERROR).send({ message: err.message }));

// Получить пользователя по id
const getUser = (req, res) => {
  const { userId } = req.params;

  return User.findById(userId)
    .then((user) => res.status(OK).send(user))
    .catch((err) => sendError(req, res, err));
};

// Создать нового пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  return User.create({ name, about, avatar })
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
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
};
