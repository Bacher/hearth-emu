
H.Screens['start-game-menu'] = class StartGameMenuScreen extends H.Screen {
    constructor() {
        super({
            name: 'start-game-menu',
            hash: 'start-game'
        });
    }

    _onShow() {
        const chooseDeck = H.app.activateOverlay('choose-hero-deck', {
            decks: H.decks.map(deck => {
                return _.extend({}, deck, { unavailable: (
                    deck.cardIds.length !== 30 ||
                    deck.cardIds.some(cardId => {
                        return H.cardsHash[cardId].flags['unimplemented']
                    })
                )});
            }),

            okButtonType: 'play',

            onChoose: selection => {
                chooseDeck.close();

                if (selection.heroClass) {
                    H.playDeck = selection.heroClass;
                } else {
                    H.playDeck = H.activeDeck;
                }

                H.app.activateScreen('waiting-opponent');
            },
            onBack: () => {
                chooseDeck.close();

                H.app.activateScreen('main-menu');
            },
            onHighlight: selection => {
                if (selection.deckId) {
                    H.activeDeck = H.getDeckById(selection.deckId);
                    H.saveDecks();
                }
            }
        });
    }
};
