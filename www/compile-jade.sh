#!/usr/bin/env sh
#/usr/local/bin/clientjade **/*.jade > js/_templates.js

/usr/local/bin/clientjade \
    ./screens/battle-end/battle-end.jade \
    ./screens/battle-welcome/battle-welcome.jade \
    ./screens/battle-welcome/repick-cards.jade \
    ./screens/battle/animations/fatigue-card.jade \
    ./screens/battle/animations/hero-skill-card.jade \
    ./screens/battle/animations/projectile.jade \
    ./screens/battle/animations/secret-card.jade \
    ./screens/battle/animations/secret-splash.jade \
    ./screens/battle/animations/splash.jade \
    ./screens/battle/animations/chanel.jade \
    ./screens/battle/battle.jade \
    ./screens/battle/chat/big-ballon.jade \
    ./screens/battle/chat/chat.jade \
    ./screens/battle/creatures/creature.jade \
    ./screens/battle/creatures/minion-preview.jade \
    ./screens/battle/hand/card.jade \
    ./screens/battle/hand/hand.jade \
    ./screens/battle/notice-cloud.jade \
    ./screens/battle/op-hand.jade \
    ./screens/battle/simple-card.jade \
    ./screens/battle/traps.jade \
    ./screens/choose-card/choose-card.jade \
    ./screens/choose-hero-deck/choose-hero-deck.jade \
    ./screens/collection-deck/card-lines.jade \
    ./screens/collection-deck/collection-deck.jade \
    ./screens/collection-deck/deck-card-preview.jade \
    ./screens/collection-decks/collection-decks.jade \
    ./screens/collection-decks/decks.jade \
    ./screens/collection/collection-cards.jade \
    ./screens/collection/collection.jade \
    ./screens/menu/menu.jade \
    ./screens/loading/loading.jade \
    ./screens/main-menu/main-menu.jade \
    ./screens/options/options.jade \
    ./screens/waiting-opponent/waiting-opponent.jade \
    > _js/_templates.js
