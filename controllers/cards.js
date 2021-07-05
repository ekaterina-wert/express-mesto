const Card = require('../models/card');
const { OK } = require('../utils/constants');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');
const BadRequestError = require('../errors/bad-request-error');

const checkCardIfExists = (card, res) => {
  if (card) res.status(OK).send(card);
  throw new NotFoundError('Карточка с указанным _id не найдена');
};

// Получить список карточек
const getCards = (req, res, next) => Card.find({})
  .then((cards) => res.status(OK).send(cards))
  .catch(next);

// Создать новую карточку
const createCard = (req, res, next) => {
  const { name, link } = req.body;

  return Card.create({ name, link, owner: req.user._id })
    .then((card) => checkCardIfExists(card))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      next(err);
    });
};

// Удалить карточку
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  return Card.findById(cardId)
    .then((card) => {
      if (!card) throw new NotFoundError('Карточка с указанным _id не найдена');

      const ifOwner = JSON.stringify(req.user._id) === JSON.stringify(card.owner);

      if (!ifOwner) throw new ForbiddenError('Вы не можете удалять эту карточку');
      return card.remove()
        .then(() => res.status(OK).send({ message: 'Карточка успешно удалена' }));
    })
    .catch(next);
};

// Поставить лайк карточке
const likeCard = (req, res, next) => {
  const { cardId } = req.params;

  return Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => checkCardIfExists(card, res))
    .catch(next);
};

// Убрать лайк карточки
const unlikeCard = (req, res, next) => {
  const { cardId } = req.params;

  return Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => checkCardIfExists(card, res))
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  unlikeCard,
};
