const Card = require('../models/card');
const {
  OK, BAD_REQUEST, NOT_FOUND, SERVER_ERROR,
} = require('../utils/constants');

const sendError = (req, res, err) => {
  if (err.name === 'CastError') return res.status(BAD_REQUEST).send({ message: 'Передан некорректный id карточки' });
  if (err.name === 'ValidationError') return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
  return res.status(SERVER_ERROR).send({ message: err.message });
};

const checkCardIfExists = (card, res) => {
  if (card) res.status(OK).send(card);
  res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
};

// Получить список карточек
const getCards = (req, res) => Card.find({})
  .then((cards) => res.status(OK).send(cards))
  .catch((err) => res.status(SERVER_ERROR).send({ message: err.message }));

// Создать новую карточку
const createCard = (req, res) => {
  const { name, link } = req.body;

  return Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(OK).send(card))
    .catch((err) => sendError(req, res, err));
};

// Удалить карточку
const deleteCard = (req, res) => {
  const { cardId } = req.params;

  return Card.findById(cardId)
    .then((card) => {
      if (!card) return res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });

      const ifOwner = JSON.stringify(req.user._id) === JSON.stringify(card.owner);
      // return res.send([ifOwner, JSON.stringify(req.user._id), JSON.stringify(card.owner)]);

      if (!ifOwner) return res.status(403).send({message: 'У вас нет прав удалять эту карточку' });
      return card.remove()
        .then(() => res.status(OK).send({ message: 'карточка успешно удалена' }));
    })
    .catch((err) => sendError(req, res, err));
};

// Поставить лайк карточке
const likeCard = (req, res) => {
  const { cardId } = req.params;

  return Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => checkCardIfExists(card, res))
    .catch((err) => sendError(req, res, err));
};

// Убрать лайк карточки
const unlikeCard = (req, res) => {
  const { cardId } = req.params;

  return Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => checkCardIfExists(card, res))
    .catch((err) => sendError(req, res, err));
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
