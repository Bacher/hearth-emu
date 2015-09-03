
const H = require('./namespace');


const cardsRaw = require('./cards/minions.json');

const cards = cardsRaw.map(card => new H.Card(card));

const cardsHash = {};

for (var i = 0; i < cards.length; ++i) {
    var card = cards[i];
    cardsHash[card.id] = card;
}

H.CARDS = {
    list: cards,
    hash: cardsHash,
    getById: function(id) {
        return this.hash[id];
    },
    getByName: function(name, type) {
        const lowerCaseName = name.toLowerCase();

        for (var i = 0; i < cards.length; ++i) {
            const card = cards[i];

            if (type && card.type !== type) {
                continue;
            }

            if (card.name.toLowerCase() === lowerCaseName) {
                return card;
            }
        }
    }
};
