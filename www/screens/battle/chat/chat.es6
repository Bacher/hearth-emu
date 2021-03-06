
H.Chat = class Chat {
    constructor(battle) {
        this._battle = battle;
        this.$node = battle.$node.find('.chat-wrapper');

        this._inputShowed = false;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onChatMessage = this._onChatMessage.bind(this);

        this._render();

        this._bindEventListeners();
    }

    _render() {
        render(this.$node, 'chat');

        this._$messages = this.$node.find('.messages');
        this._$input = this.$node.find('.message-input INPUT');
    }

    _bindEventListeners() {
        $(document).on('keydown', this._onKeyDown);

        H.socket.on('chat-message', this._onChatMessage);

        this._$input.on('keyup', e => {
            if (e.which === H.KEYS.escape) {
                e.preventDefault();
                e.stopPropagation();

                this._hideInput();
            }
        });
    }

    _unbindEventListeners() {
        H.socket.off('chat-message', this._onChatMessage);

        $(document).off('keydown', this._onKeyDown);
    }

    _onKeyDown(e) {
        if (e.which === H.KEYS['enter']) {
            if (this._inputShowed) {
                this._sendMessage();
            } else {
                this._showInput();
            }
        }
    }

    _showInput() {
        this._inputShowed = true;

        this.$node.find('.prompt').remove();

        this.$node.find('.message-input').show();
        this._$input.focus();
    }

    _clearInput() {
        this._$input.val('');
    }

    _hideInput() {
        this._clearInput();

        this.$node.find('.message-input').hide();

        this._inputShowed = false;
    }

    _sendMessage() {
        const message = this._$input.val().trim();

        if (message) {
            H.socket.send('chat-message', message);
        }

        this._hideInput();
    }

    _onChatMessage(data) {
        const $message = render(null, 'message', data);

        setTimeout(() => {
            $message.addClass('hide');
        }, 12000);

        this._$messages
            .append($message)
            .scrollTop(999);
    }
};
