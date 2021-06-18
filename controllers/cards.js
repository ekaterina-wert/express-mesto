const Card = require('../models/card');

getCards = (req, res) => {
  return Card.find({})
    .then(cards => res.status(200).send({ data: cards }))
    .catch(err => res.status(500).send({ message: err.message }));
};

createCard = (req, res) => {
  console.log(req.user._id);
  const { name, link } = req.body;

  return Card.create({ name, link, owner: req.user._id })
    .then(card => res.status(200).send({ data: card }))
    .catch(err => res.status(500).send({ message: err.message }));
};

deleteCard = (req, res) => {
  console.log(req.user._id);

  const { id } = req.params;

  return Card.findByIdAndDelete(id)
    .then(card => {
      if (card) {
        return res.status(200).send({ data: card })
      }
      return res.status(404).send({ message: err.message }) //'Карточка с таким ID отсутсвует'
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

module.exports = {
  getCards,
  createCard,
  deleteCard
}