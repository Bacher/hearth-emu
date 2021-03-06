
const _ = require('lodash');
const H = require('../namespace');

H.HeroSkill = class HeroSkill {
    constructor(hero, options) {
        this.player = hero.player;
        this._hero = hero;

        this.name = options.name || 'unknown';

        this.objType = 'hero-skill';

        this.id = _.uniqueId('skill');

        if (options.customAction) {
            this._customAction = options.customAction;

        } else {
            this.command = H.Command.createByAct({
                name: options.activation,
                params: options.params || [],
                animation: options.animation,
                targetsType: options.targetsType
            });
        }

        this._needTarget = options.skillNeedTarget;
        this._targets = options.targets;
        this._cost = options.cost || 2;
        this._additionCheck = options.additionCheck;

        this._usedCount = 0;
    }

    use(o) {
        o.animationBy = this;

        if (this._customAction) {
            H.CustomActions.getByName(this._customAction)({
                player: this.player
            });
        } else {
            this.getData().command.act(o);
        }

        this._usedCount++;

        this.player.battle.emit('use-hero-skill', {
            player: this.player
        });
    }

    getName() {
        return this.name;
    }

    charge() {
        this._usedCount = 0;
    }

    canUseSkill() {
        return (
            this.player.active &&
            !this.isUsed() &&
            this.player.energy.getMana() >= this.getCost() &&
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
            targets: this._needTarget && this._targets,
            cost: this._cost
        };
    }

    _modifyClientData(data) {
        delete data.command;
        delete data.maxUseCount;
        delete data.targets;
        delete data.cost;

        data.name = this.name;
        data.skillUsed = this.isUsed();
        data.canUseSkill = this.canUseSkill();
    }
};

H.mixGameDataAccessors(H.HeroSkill);
