
const _ = require('lodash');
const H = require('../namespace');

H.HeroSkill = class HeroSkill {
    constructor(hero, options) {
        this.player = hero.player;
        this._hero = hero;

        this.name = options.name || 'unknown';

        this.objType = 'hero-skill';

        this.id = _.uniqueId('skill');

        this.command = H.Command.createByAct({
            name: options.activation,
            params: options.params || [],
            animation: options.animation,
            targetsType: options.targetsType
        });

        this._needTarget = options.skillNeedTarget;
        this._targets = options.targets;
        this._cost = options.cost || 2;
        this._additionCheck = options.additionCheck;

        this._usedCount = 0;
    }

    use(o) {
        o.animationBy = this;
        console.log(this.getData());
        this.getData().command.act(o);

        this._usedCount++;
    }

    charge() {
        this._usedCount = 0;
    }

    canUseSkill() {
        return (
            this._hero.player.active &&
            !this.isUsed() &&
            this._hero.mana >= this.getCost() &&
            (!this._additionCheck || this._additionCheck())
        );
    }

    isUsed() {
        return this._usedCount === this.getData().maxUseCount;
    }

    getCost() {
        return this._cost;
    }

    isNeedTarget() {
        return !!this.getData().needTarget;
    }

    getTargetsType() {
        return this.getData().targets;
    }

    getBaseData() {
        return {
            that: this,
            command: this.command,
            maxUseCount: 1,
            needTarget: this._needTarget,
            targets: this._needTarget && this._targets
        };
    }
};

H.mixGameDataAccessors(H.HeroSkill);
