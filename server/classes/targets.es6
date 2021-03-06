
const _ = require('lodash');
const H = require('../namespace');

H.Targets = class Targets {
    constructor(player) {
        this.player = player;

        this.empty();
    }

    static parseUserData(player, params) {
        const targets = new H.Targets(player);

        targets.addObject(player.battle.getObjectById(params.targetId));

        return targets;
    }

    static createFromMinion(player, minion) {
        const targets = new Targets(player);

        targets.addMinion(minion);

        return targets;
    }

    static getAllMinions(player) {
        const targets = new H.Targets(player);

        targets.addFriendlyMinions();
        targets.addEnemyMinions();

        return targets;
    }

    applyModificators(modificators) {
        if (modificators) {
            modificators.forEach(mod => {
                this[mod.name](...mod.params);
            });
        }
    }

    contains(object) {
        return (
            object === this.my.hero || _.contains(this.my.minions, object) ||
            object === this.op.hero || _.contains(this.op.minions, object));
    }

    addObject(object) {
        if (object.objType === 'minion') {
            this.addMinion(object);

        } else if (object.objType === 'hero') {
            this.addHero(object);
        }
    }

    addMinion(minion) {
        var destination;

        if (minion.player === this.player) {
            destination = this.my.minions;
        } else {
            destination = this.op.minions;
        }

        if (destination.indexOf(minion) === -1) {
            destination.push(minion);
        }
    }

    addMinions(minions) {
        minions.forEach(minion => this.addMinion(minion));
    }

    addFriendlyMinions() {
        this.addMinions(this.player.creatures.getAll());
    }

    addEnemyMinions() {
        this.addMinions(this.player.enemy.creatures.getAll());
    }

    removeMinion(minion) {
        var minions;

        if (minion.player === this.player) {
            minions = this.my.minions;
        } else {
            minions = this.op.minions;
        }

        minions.splice(minions.indexOf(minion), 1);
    }

    // FIXME переименовать
    removeHiddenEnemies() {
        this.op.minions = this.op.minions.filter(minion => {
            const minionFlags = minion.getData().flags;

            return !minionFlags['stealth'] && !minionFlags['spell-stealth'] && !minionFlags['immune'];
        });

        if (this.op.hero) {
            const heroFlags = this.player.enemy.hero.getData().flags;

            if (heroFlags['immune']) {
                this.op.hero = false;
            }
        }

        return this;
    }

    addHero(hero) {
        if (hero.player === this.player) {
            this.addMyHero();
        } else {
            this.addEnemyHero();
        }
    }

    addMyHero() {
        this.my.hero = true;
    }

    removeMyHero() {
        this.my.hero = false;
    }

    addEnemyHero() {
        this.op.hero = true;
    }

    merge(that) {
        ['my', 'op'].forEach(side => {
            this[side].hero = this[side].hero || that[side].hero;

            that[side].minions.forEach(minion => {
                if (this[side].minions.indexOf(minion) === -1) {
                    this[side].minions.push(minion);
                }
            });
        });

        return this;
    }

    getCount() {
        return this.my.minions.length + this.op.minions.length +
            (this.my.hero ? 1 : 0) + (this.op.hero ? 1 : 0);
    }

    getOne() {
        const minion = this.getOneMinion();

        if (minion) {
            return minion
        } else if (this.my.hero) {
            return this.player.hero;
        } else if (this.op.hero) {
            return this.player.enemy.hero;
        }
    }

    getOneMinion() {
        if (this.my.minions.length) {
            return this.my.minions[0];
        } else if (this.op.minions.length) {
            return this.op.minions[0];
        }
    }

    getAll() {
        var all = [];

        all = all.concat(this.my.minions);
        all = all.concat(this.op.minions);

        if (this.my.hero) {
            all.push(this.player.hero);
        }

        if (this.op.hero) {
            all.push(this.player.enemy.hero);
        }

        return all;
    }

    forEach(func) {
        this.getAll().forEach(func);
    }

    map(func) {
        return this.getAll().map(func);
    }

    intersect(that) {
        this.my.hero = this.my.hero && that.my.hero;
        this.op.hero = this.op.hero && that.op.hero;

        this.my.minions = _.intersection(this.my.minions, that.my.minions);
        this.op.minions = _.intersection(this.op.minions, that.op.minions);

        return this;
    }

    empty() {
        this.my = {
            minions: [],
            hero: false
        };

        this.op = {
            minions: [],
            hero: false
        };
    }

    clone() {
        const targets = new H.Targets(this.player);

        targets.my.minions = _.clone(this.my.minions);
        targets.op.minions = _.clone(this.op.minions);

        targets.my.hero = this.my.hero;
        targets.op.hero = this.op.hero;

        return targets;
    }

    _getAdjacentMinions() {
        const minion = this.getOneMinion();

        if (minion) {
            return minion.player.creatures.getAdjacent(minion);
        }
    }

    'random'(count) {
        const objects = this.my.minions.concat(this.op.minions);

        if (this.my.hero) {
            objects.push('my-hero');
        }

        if (this.op.hero) {
            objects.push('op-hero');
        }

        this.my = {
            minions: [],
            hero: false
        };

        this.op = {
            minions: [],
            hero: false
        };

        for (var i = 0; i < count && objects.length; ++i) {
            const index = _.random(objects.length - 1);
            const obj = objects[index];

            objects.splice(index, 1);

            const side = this[obj.player === this.player ? 'my' : 'op'];

            if (obj === 'my-hero' || obj === 'op-hero') {
                side.hero = true;
            } else {
                side.minions.push(obj);
            }
        }
    }

    'attack-more'(than) {
        this._filterAll(obj => obj.attack > than);
    }

    'attack-less'(than) {
        this._filterAll(obj => obj.attack < than);
    }

    'damaged'() {
        this._filterAll(obj => obj.hp < obj.maxHp);
    }

    'undamaged'() {
        this._filterAll(obj => obj.hp === obj.maxHp);
    }

    'race'(race) {
        const raceId = H.RACES[race];
        this._filterAll(obj => obj.race === raceId);
    }

    'non-race'(race) {
        const raceId = H.RACES[race];
        this._filterAll(obj => obj.race !== raceId);
    }

    'adjacent'() {
        const adjacent = this._getAdjacentMinions();

        this.empty();

        this.addMinions(adjacent);
    }
    'add-adjacent'() {
        this.addMinions(this._getAdjacentMinions());
    }
    'invert'() {
        this._invertMinions(this.my, this.player.creatures);
        this._invertMinions(this.op, this.player.enemy.creatures);

        this.my.hero = !this.my.hero;
        this.op.hero = !this.op.hero;
    }
    'enemies'() {
        this.my.hero = false;
        this.my.minions.length = 0;
    }
    'invert-minions'() {
        this._invertMinions(this.my, this.player.creatures);
        this._invertMinions(this.op, this.player.enemy.creatures);
    }
    'with'(flag) {
        this._filterAll(obj => obj.getData().flags[flag]);
    }
    'legendary'() {
        this._filterAll(obj => obj.card.flags['unique']);
    }
    'name'(minionName) {
        minionName = minionName.toLowerCase();

        this._filterAll(obj => obj.card.name.toLowerCase() === minionName);
    }
    'except'(minionName) {
        minionName = minionName.toLowerCase();

        this._filterAll(obj => obj.card.name.toLowerCase() !== minionName);
    }

    _invertMinions(side, playerCreatures) {
        side.minions = playerCreatures.getAll().filter(creature => {
            return !_.contains(side.minions, creature);
        });
    }

    _filterAll(filterFunc) {
        this._filterMinions(filterFunc);

        if (this.my.hero) {
            this.my.hero = filterFunc(this.player.hero);
        }

        if (this.op.hero) {
            this.op.hero = filterFunc(this.player.enemy.hero);
        }
    }

    _filterMinions(filterFunc) {
        this.my.minions = this.my.minions.filter(filterFunc);
        this.op.minions = this.op.minions.filter(filterFunc);
    }

    getGameData() {
        return {
            my: {
                minions: this.my.minions.map(minion => minion.id),
                hero: this.my.hero

            },
            op: {
                minions: this.op.minions.map(minion => minion.id),
                hero: this.op.hero
            }
        };
    }
};
