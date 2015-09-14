
H.PlayCard = class PlayCard {
    constructor(battle) {
        this.battle = battle;

        this.$node = battle.$node;

        this._$clickObject = null;
        this._$grabCard = null;
        this._$arrow = this.$node.find('.arrow');

        this._mouse = null;

        this._onMouseDown = this._addUpdateMouseWrap(this._onMouseDown);
        this._onMouseMove = this._addUpdateMouseWrap(this._onMouseMove);
        this._onMouseUp = this._addUpdateMouseWrap(this._onMouseUp);

        this._arrowMode = false;
        this._targeting = false;

        this.$node.addClass('normal-mode');

        this._arrowBasePosition = null;

        this.PLAY_CARD_HEIGHT = 575;
    }

    bindEventListeners() {
        // FIXME How unbind?
        H.socket.on('targets', this._setPurposes.bind(this));

        this.$node
            .on('mousedown', '.card-wrap', this._ifActiveWrap(this._onMouseDown))
            .on('mousedown', '.creature.available', this._ifActiveWrap(this._onMouseDown));
    }

    _onMouseDown(e) {
        if (!this._targeting) {
            this._$clickObject = $(e.currentTarget);

            this.$node
                .on('mousemove', this._onMouseMove)
                .on('mouseup', this._onMouseUp);
        }
    }

    _onMouseMove(e) {
        if (this._targeting) {
            if (this._mouse.y < this.PLAY_CARD_HEIGHT) {
                if (this._isCardPlayable) {
                    if (this._isCard) {
                        if (this._needTarget) {
                            if (!this._arrowMode) {
                                this._$grabCard.hide();

                                this._toggleAimTargeting(true);
                            }

                            this._toggleCrosshair($(e.target).closest('.purpose').length > 0);

                        } else {
                            this._toggleCardActivation(true);

                            this._shiftMinions();
                        }
                    } else {
                        this._toggleCrosshair($(e.target).closest('.purpose').length > 0);
                    }
                } else {
                    this._showErrorMessage();
                    this._release(true);
                    return;
                }

            } else {
                if (this._isCard) {
                    if (this._needTarget) {
                        if (this._arrowMode) {
                            this._toggleAimTargeting(false);
                            this._$grabCard.show();
                        }
                    } else {
                        this._toggleCardActivation(false);
                    }
                } else {
                    this._release(true);
                    return;
                }
            }

            this._updateDragItemPosition();

        } else {
            this._grabObject();
        }
    }

    _onMouseUp(e) {
        if (this._targeting) {
            if (this._needTarget || this._isMinion) {
                const $targetPurpose = $(e.target).closest('.purpose');

                if ($targetPurpose.length) {
                    this._$targetPurpose = $targetPurpose;

                    this._release();
                }

            } else {
                this._release();
            }

        } else {
            this._grabObject();
        }
    }

    _release(isCancel) {
        this.$node
            .off('mousemove', this._onMouseMove)
            .off('mouseup', this._onMouseUp);

        if (!isCancel && this._mouse.y < this.PLAY_CARD_HEIGHT) {
            this._makeAction();

        } else {
            if (this._isCard) {
                this._$clickObject.show();
            } else {
                this._$clickObject.removeClass('find-target');
            }
        }

        this._toggleCardActivation(false);
        this._toggleAimTargeting(false);

        this._clearPurposes();

        this._targeting = false;
        this._$clickObject = null;
        this._$targetPurpose = null;
        this._$arrowBaseObject = null;

        if (this._isCard) {
            this._$grabCard.remove();
            this._$grabCard = null;
        }
    }

    _grabObject() {
        this._targeting = true;

        this._isCard = this._$clickObject.hasClass('card-wrap');
        this._isMinionCard = this._isCard && this._$clickObject.hasClass('minion');

        this._isMinion = this._$clickObject.hasClass('creature');

        if (this._isMinion) {
            this._$clickObject.addClass('find-target');
            this._$arrowBaseObject = this._$clickObject;

            this._toggleAimTargeting(true);

        } else if (this._isCard) {
            this._$arrowBaseObject = this.$node.find('.avatar.my');

            this._$grabCard = this._$clickObject.clone();
            this._$grabCard.addClass('grab-card');

            this._needTarget = this._$grabCard.hasClass('need-target');
            this._isCardPlayable = this._$grabCard.hasClass('available');

            this._$clickObject.hide();

            this._$grabCard.appendTo(this.$node);
        }

        this._updateDragItemPosition();
    }

    _updateDragItemPosition() {
        if (this._arrowMode) {

            const dX = this._arrowBasePosition.x - this._mouse.x;
            const dY = this._arrowBasePosition.y - this._mouse.y;

            const distance = Math.sqrt(dX * dX + dY * dY);

            var angle = Math.atan(dX / dY);

            if (dY < 0) {
                angle = angle + Math.PI;
            }

            this._$arrow
                .height(distance)
                .css('transform', 'rotate(' + -angle + 'rad)');

        } else {
            const x = this._mouse.x - 40;
            const y = this._mouse.y - 50;

            this._$grabCard.css({
                top: y,
                left: x
            });
        }
    }

    _makeAction() {
        var actionName;
        const actionData = {};

        if (this._isCard) {
            actionName = 'play-card';
            actionData.id = this._$clickObject.data('id');

            if (this._isMinionCard) {

                const index = this.$node.find('.creature.shift-right').index();

                actionData.index = index === -1 ? 0 : index;
            }
        } else {
            actionName = 'hit';
            actionData.by = this._$clickObject.data('id');
        }

        if (this._isMinion || this._needTarget) {
            actionData.targetSide = this._$targetPurpose.closest('.creatures').hasClass('my') ? 'my' : 'op';
            actionData.target = this._$targetPurpose.data('id');
        }

        H.socket.send(actionName, actionData);
    }

    _ifActiveWrap(callback) {
        const battle = this.battle;
        return function() {
            if (battle.battleData.my.active) {
                callback.apply(this, arguments);
            }
        };
    }

    _toggleAimTargeting(enable) {
        this.$node.toggleClass('arrow-mode', enable);
        this.$node.toggleClass('normal-mode', !enable);

        this._$arrow.toggle(enable);

        this._arrowMode = enable;

        if (enable) {
            this._setArrowBase();

            const actionData = {};

            if (this._isCard) {
                actionData.cardId = this._$clickObject.data('id');
            } else {
                actionData.creatureId = this._$clickObject.data('id');
            }

            H.socket.send('get-targets', actionData);

        } else {
            this._$arrow.removeClass('with-crosshair');
        }
    }

    _toggleCardActivation(enable) {
        if (this._isCard) {

            this._$grabCard.toggleClass('blue-glow', enable);

            if (enable) {
                if (this._isMinionCard) {
                    if (!this._minionsPositions) {
                        this._minions = this.$node.find('.my .creature');
                        this._minionsPositions = this._minions.map((i, node) => {
                            const $minion = $(node);

                            return $minion.offset().left + $minion.outerWidth() / 2;
                        });
                    }
                }
            } else {
                if (this._isMinionCard) {
                    this._minions = null;
                    this._minionsPositions = null;
                }
            }
        }
    }

    _shiftMinions() {
        const x = this._mouse.x;

        this._minions.each((i, node) => {
            const $minion = $(node);

            const minionX = this._minionsPositions[i];

            $minion
                .toggleClass('shift-right', x <= minionX)
                .toggleClass('shift-left', x > minionX);
        });
    }

    _setArrowBase() {
        const pos = this._$arrowBaseObject.offset();

        this._arrowBasePosition = {
            x: pos.left + this._$arrowBaseObject.outerWidth() / 2,
            y: pos.top + this._$arrowBaseObject.outerHeight() / 2
        };

        this._$arrow.css({
            bottom: 720 - this._arrowBasePosition.y,
            left: this._arrowBasePosition.x
        });
    }

    _showErrorMessage() {
        window.alert('BAD MOVE');
    }

    _addUpdateMouseWrap(method) {
        const that = this;

        return function(e) {
            that._mouse = {
                x: e.pageX,
                y: e.pageY
            };

            return method.apply(that, arguments);
        };
    }

    _setPurposes(data) {
        this._clearPurposes();

        const targetsDetails = data.targets;

        if (targetsDetails !== 'not-need') {

            ['my', 'op'].forEach(side => {
                const targets = targetsDetails[side];

                if (targets) {
                    if (targets.hero) {
                        this.$node.find('.avatar.' + side).addClass('purpose');
                    }

                    if (targets.minions) {
                        targets.minions.forEach(minionId => {
                            this.$node.find('.creature[data-id="' + minionId + '"]').addClass('purpose');
                        });
                    }
                }
            });
        }
    }

    _clearPurposes() {
        this.$node.find('.purpose').removeClass('purpose');
    }

    _toggleCrosshair(enable) {
        this._$arrow.toggleClass('with-crosshair', enable);
    }

};