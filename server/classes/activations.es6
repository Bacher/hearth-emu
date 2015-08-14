
const BaseMinions = require('../base-minions');

module.exports = {
    summon: (card, battle, player) => {

        const newMinion = BaseMinions[card.param].spawn();

        if (!newMinion.base.abilities.charge) {
            newMinion.flags.sleep = true;
        }

        player.creatures.addCreature(newMinion);
    },

    addMana: param => {

    },

    dealDamage: (card, battle, player) => {},

    overload: (card, battle, player) => {},

    silence: (card, battle, player) => {}
};
