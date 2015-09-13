
const H = require('./namespace');

const C = {
    'can-add-creature'(obj) {
        return obj.player.creatures.canAddCreature();
    }
};

H.Conditions = {
    check(name, obj) {
        if (!C[name]) {
            console.warn('CONDITION NOT FOUND, NAME:', name);
            throw 1;
        }

        return C[name](obj);
    }
};
