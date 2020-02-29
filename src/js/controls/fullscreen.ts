import PlayerComponent from '../interfaces/component';
import Player from '../player';
import { IS_IPHONE } from '../utils/constants';
import { removeElement } from '../utils/general';

/**
 * Fullscreen element.
 *
 * @description Following the Fullscreen API, this class toggles media dimensions to present video
 * using the user's entire screen, even when the player is playing Ads.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 * @see https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/cross_browser_video_player#Fullscreen
 * @class Fullscreen
 * @implements PlayerComponent
 */
class Fullscreen implements PlayerComponent {
    /**
     * Flag to determine if fullscreen is available natively.
     *
     * @type boolean
     * @memberof Fullscreen
     */
    public fullScreenEnabled: boolean;

    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Fullscreen
     */
    private player: Player;

    /**
     * Flag to determine if media is currently being played in fullscreen mode.
     *
     * @private
     * @type boolean
     * @memberof Fullscreen
     */
    private isFullscreen: boolean;

    /**
     * Button to toggle fullscreen effect.
     *
     * @private
     * @type HTMLButtonElement
     * @memberof Fullscreen
     */
    private button: HTMLButtonElement;

    /**
     * List of events when fullscreen change is fired.
     *
     * @private
     * @type string[]
     * @memberof Fullscreen
     */
    private fullscreenEvents: string[];

    /**
     * Storage for user's full screen width.
     *
     * @private
     * @type number
     * @memberof Fullscreen
     */
    private fullscreenWidth: number;

    /**
     * Storage for user's full screen height.
     *
     * @private
     * @type number
     * @memberof Fullscreen
     */
    private fullscreenHeight: number;

    /**
     * Callback when user clicks Fullscreen button.
     *
     * @private
     * @memberof Fullscreen
     */
    private clickEvent: () => void;

    /**
     * Default labels from player's config
     *
     * @private
     * @type object
     * @memberof Fullscreen
     */
    private labels: any;

    /**
     * Position of the button to be indicated as part of its class name
     *
     * @private
     * @type {string}
     * @memberof Fullscreen
     */
    private position: string;

    /**
     * Create an instance of Fullscreen.
     *
     * @param {Player} player
     * @returns {Fullscreen}
     * @memberof Fullscreen
     */
    constructor(player: Player, position: string) {
        this.player = player;
        this.labels = player.getOptions().labels;
        this.position = position;
        this.isFullscreen = document.body.classList.contains('op-fullscreen__on');

        const target = (document as any);

        // Check if fullscreen is supported
        this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled ||
            target.msFullscreenEnabled || target.webkitSupportsFullscreen ||
            target.webkitFullscreenEnabled || (document.createElement('video') as any).webkitRequestFullScreen);

        return this;
    }

    /**
     * Create a button and set global events to toggle fullscreen.
     *
     * @inheritDoc
     * @memberof Fullscreen
     */
    public create(): void {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = `op-controls__fullscreen op-control__${this.position}`;
        this.button.tabIndex = 0;
        this.button.title = this.labels.fullscreen;
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', this.labels.fullscreen);
        this.button.innerHTML = `<span class="op-sr">${this.labels.fullscreen}</span>`;

        this.clickEvent = () => {
            this.button.setAttribute('aria-pressed', 'true');
            this.toggleFullscreen();
        };

        this.fullscreenEvents = [
            'fullscreenchange',
            'mozfullscreenchange',
            'webkitfullscreenchange',
            'msfullscreenchange',
        ];

        this._setFullscreenData(false);

        this.player.getContainer().addEventListener('keydown', this._keydownEvent.bind(this));

        this.fullscreenEvents.forEach(event => {
            document.addEventListener(event, this._fullscreenChange.bind(this));
        });

        this.button.addEventListener('click', this.clickEvent.bind(this));

        this.player.getControls().getContainer().appendChild(this.button);

        // Since iPhone still doesn't accept the regular Fullscreen API, use the following events
        if (IS_IPHONE) {
            this.player.getElement().addEventListener('webkitbeginfullscreen', () => {
                this.isFullscreen = true;
                this._setFullscreenData(true);
                document.body.classList.add('op-fullscreen__on');
            });
            this.player.getElement().addEventListener('webkitendfullscreen', () => {
                this.isFullscreen = false;
                this._setFullscreenData(false);
                document.body.classList.remove('op-fullscreen__on');
            });
        }
    }

    /**
     *
     * @inheritDoc
     * @memberof Fullscreen
     */
    public destroy(): void {
        this.player.getContainer().removeEventListener('keydown', this._keydownEvent.bind(this));

        this.fullscreenEvents.forEach(event => {
            document.removeEventListener(event, this._fullscreenChange.bind(this));
        });
        if (IS_IPHONE) {
            this.player.getElement().removeEventListener('webkitbeginfullscreen', () => {
                this.isFullscreen = true;
                this._setFullscreenData(false);
                document.body.classList.add('op-fullscreen__on');
            });
            this.player.getElement().removeEventListener('webkitendfullscreen', () => {
                this.isFullscreen = false;
                this._setFullscreenData(true);
                document.body.classList.remove('op-fullscreen__on');
            });
        }
        this.button.removeEventListener('click', this.clickEvent.bind(this));
        removeElement(this.button);
    }

    /**
     * Enter/cancel fullscreen depending of browser's capabilities.
     *
     * If browser does not support native Fullscreen API, player will adjust the video
     * and its parent container's dimensions via width and height styles.
     * @memberof Fullscreen
     */
    public toggleFullscreen(): void {
        // The video is currently in fullscreen mode
        if (this.isFullscreen) {
            const target = (document as any);
            if (target.exitFullscreen) {
                target.exitFullscreen();
            } else if (target.mozCancelFullScreen) {
                target.mozCancelFullScreen();
            } else if ((document as any).webkitCancelFullScreen) {
                target.webkitCancelFullScreen();
            } else if (target.msExitFullscreen) {
                target.msExitFullscreen();
            } else {
                this._fullscreenChange();
            }
            document.body.classList.remove('op-fullscreen__on');
        } else {
            const video = (this.player.getElement() as any);
            this.fullscreenWidth = window.screen.width;
            this.fullscreenHeight = window.screen.height;

            if (video.requestFullscreen) {
                video.parentElement.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.parentElement.mozRequestFullScreen();
            } else if (video.webkitRequestFullScreen) {
                video.parentElement.webkitRequestFullScreen();
            } else if (video.msRequestFullscreen) {
                video.parentElement.msRequestFullscreen();
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            } else {
                this._fullscreenChange();
            }

            document.body.classList.add('op-fullscreen__on');
        }
    }

    /**
     * Callback to toggle fullscreen for browsers thta do not support native Fullscreen API.
     *
     * @private
     * @memberof Fullscreen
     */
    private _fullscreenChange(): void {
        const width = this.isFullscreen ? 0 : this.fullscreenWidth;
        const height = this.isFullscreen ? 0 : this.fullscreenHeight;
        this._setFullscreenData(!this.isFullscreen);

        if (this.player.isAd()) {
            this.player.getAd().resizeAds(width, height);
        }
        this.isFullscreen = !this.isFullscreen;

        if (this.isFullscreen) {
            document.body.classList.add('op-fullscreen__on');
        } else {
            document.body.classList.remove('op-fullscreen__on');
        }
        this._resize(width, height);
    }

    /**
     * Update the `data-fullscreen` of the player's container and toggle button's class
     * depending if player is on fullscreen mode or not.
     *
     * @private
     * @param {boolean} state  Whether media is fullscreen or not
     * @memberof Fullscreen
     */
    private _setFullscreenData(state: boolean): void {
        this.player.getContainer().setAttribute('data-fullscreen', (!!state).toString());
        if (state) {
            this.button.classList.add('op-controls__fullscreen--out');
        } else {
            this.button.classList.remove('op-controls__fullscreen--out');
        }
    }

    /**
     * Set dimensions for the video tag and player's container.
     *
     * @private
     * @param {?number} width The width of the media
     * @param {?number} height The height of the media
     * @memberof Fullscreen
     */
    private _resize(width?: number, height?: number): void {
        const wrapper = this.player.getContainer();
        const video = this.player.getElement();
        wrapper.style.width = width ? '100%' : null;
        wrapper.style.height = height ? '100%' : null;
        video.style.width = width ? '100%' : null;
        video.style.height = height ? '100%' : null;
    }

    /**
     * Use the `F` key to go fullscreen if the focus is on player.
     *
     * @private
     * @param {KeyboardEvent} e
     * @memberof Fullscreen
     */
    private _keydownEvent(e: KeyboardEvent) {
        const key = e.which || e.keyCode || 0;
        if (key === 70 && !e.ctrlKey && typeof this.fullScreenEnabled !== 'undefined') {
            this.toggleFullscreen();
            e.preventDefault();
        }
    }
}

export default Fullscreen;
