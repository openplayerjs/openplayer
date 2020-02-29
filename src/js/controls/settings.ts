import PlayerComponent from '../interfaces/component';
import EventsList from '../interfaces/events-list';
import SettingsItem from '../interfaces/settings/item';
import SettingsSubItem from '../interfaces/settings/subitem';
import SettingsSubMenu from '../interfaces/settings/submenu';
import Player from '../player';
import { hasClass, removeElement } from '../utils/general';

/**
 * Settings element.
 *
 * @description This class creates a menu of options to manipulate media that cannot
 * be placed in the main control necessarily (such as different captions associated with media,
 * levels of speed to play media, etc.)
 * This element is based on YouTube's Settings element.
 * @class Settings
 * @implements PlayerComponent
 */
class Settings implements PlayerComponent {
    /**
     * Instance of OpenPlayer.
     *
     * @private
     * @type Player
     * @memberof Settings
     */
    private player: Player;

    /**
     * Collection of items associated with a specific menu item.
     *
     * @private
     * @type SettingsSubMenu
     * @memberof Settings
     */
    private submenu: SettingsSubMenu = {};

    /**
     * Button to toggle menu's visibility.
     *
     * @private
     * @type HTMLButtonElement
     * @memberof Settings
     */
    private button: HTMLButtonElement;

    /**
     * HTML markup to display Settings options.
     *
     * @private
     * @type HTMLElement
     * @memberof Settings
     */
    private menu: HTMLElement;

    /**
     * Events that will be triggered in Settings element:
     *  - global (to hide menu on resize and manipulate speed levels, and to manipulate submenu elements)
     *  - media (to hide menu when media is played/paused or when `controls.hide` is triggered)
     *
     * @private
     * @type EventsList
     * @memberof Settings
     */
    private events: EventsList = {
        global: {},
        media: {},
    };

    /**
     * Storage of the initial state of the menu's markup.
     *
     * @private
     * @type string
     * @memberof Settings
     */
    private originalOutput: string;

    /**
     * Event that displays main menu when clicking in Settings button.
     *
     * @private
     * @type callback
     * @memberof Settings
     */
    private clickEvent: () => void;

    /**
     * Event that hides Settings main menu when other events occur, such as play/pause media
     * or when resizing the user's window.
     *
     * @private
     * @type callback
     * @memberof Settings
     */
    private hideEvent: () => void;

    /**
     * Event that is triggered when an element from Settings is removed.
     *
     * @private
     * @type callback
     * @memberof Settings
     */
    private removeEvent: (e: CustomEvent) => void;

    /**
     * Default labels from player's config
     *
     * @private
     * @type object
     * @memberof Settings
     */
    private labels: any;

    /**
     * Position of the button to be indicated as part of its class name
     *
     * @private
     * @type {string}
     * @memberof Settings
     */
    private position: string;

    /**
     * Create an instance of Settings.
     *
     * @param {Player} player
     * @returns {Settings}
     * @memberof Settings
     */
    constructor(player: Player, position: string) {
        this.player = player;
        this.labels = player.getOptions().labels;
        this.position = position;
        return this;
    }

    /**
     *
     * @inheritDoc
     * @memberof Settings
     */
    public create(): void {
        this.button = document.createElement('button');
        this.button.className = `op-controls__settings op-control__${this.position}`;
        this.button.tabIndex = 0;
        this.button.title = this.labels.settings;
        this.button.setAttribute('aria-controls', this.player.id);
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', this.labels.settings);
        this.button.innerHTML = `<span class="op-sr">${this.labels.settings}</span>`;

        this.menu = document.createElement('div');
        this.menu.className = 'op-settings';
        this.menu.setAttribute('aria-hidden', 'true');
        this.menu.innerHTML = '<div class="op-settings__menu" role="menu"></div>';

        this.clickEvent = () => {
            this.button.setAttribute('aria-pressed', 'true');
            const menus = this.player.getContainer().querySelectorAll('.op-settings');
            for (let i = 0, total = menus.length; i < total; ++i) {
                if (menus[i] !== this.menu) {
                    menus[i].setAttribute('aria-hidden', 'true');
                }
            }
            this.menu.setAttribute('aria-hidden', (this.menu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false'));
        };

        this.hideEvent = () => {
            let timeout;
            if (timeout && typeof window !== 'undefined') {
                window.cancelAnimationFrame(timeout);
            }

            if (typeof window !== 'undefined') {
                timeout = window.requestAnimationFrame(() => {
                    this.menu.innerHTML = this.originalOutput;
                    this.menu.setAttribute('aria-hidden', 'true');
                });
            }
        };

        this.removeEvent = (e: CustomEvent) => {
            const { id, type } = e.detail;
            this.removeItem(id, type);
        };

        this.events.media.controlshidden = this.hideEvent.bind(this);
        this.events.media.settingremoved = this.removeEvent.bind(this);
        this.events.media.play = this.hideEvent.bind(this);
        this.events.media.pause = this.hideEvent.bind(this);

        this.events.global.click = (e: any) => {
            if (e.target.closest(`#${this.player.id}`) && hasClass(e.target, 'op-speed__option')) {
                this.player.getMedia().playbackRate = parseFloat(e.target.getAttribute('data-value').replace('speed-', ''));
            }
        };
        this.events.global.resize = this.hideEvent.bind(this);

        this.button.addEventListener('click', this.clickEvent.bind(this));
        Object.keys(this.events).forEach(event => {
            this.player.getElement().addEventListener(event, this.events.media[event]);
        });
        document.addEventListener('click', this.events.global.click);
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.events.global.resize);
        }

        this.player.getControls().getContainer().appendChild(this.button);
        this.player.getContainer().appendChild(this.menu);
    }

    /**
     *
     * @inheritDoc
     * @memberof Settings
     */
    public destroy(): void {
        this.button.removeEventListener('click', this.clickEvent.bind(this));
        Object.keys(this.events).forEach(event => {
            this.player.getElement().removeEventListener(event, this.events.media[event]);
        });
        document.removeEventListener('click', this.events.global.click);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.events.global.resize);
        }
        if (this.events.global['settings.submenu'] !== undefined) {
            document.removeEventListener('click', this.events.global['settings.submenu']);
            this.player.getElement().removeEventListener('controlshidden', this.hideEvent);
        }

        removeElement(this.menu);
        removeElement(this.button);
    }

    /**
     * Build `Settings` default option: media speed levels
     *
     * @returns {SettingItem}
     * @memberof Settings
     */
    public addSettings(): SettingsItem {
        return {
            className: 'op-speed__option',
            default: this.player && this.player.getMedia() ? this.player.getMedia().defaultPlaybackRate.toString() : '1',
            key: 'speed',
            name: this.labels.speed,
            subitems: [
                { key: '0.25', label: '0.25' },
                { key: '0.5', label: '0.5' },
                { key: '0.75', label: '0.75' },
                { key: '1', label: this.labels.speedNormal },
                { key: '1.25', label: '1.25' },
                { key: '1.5', label: '1.5' },
                { key: '2', label: '2' },
            ],
        };
    }

    /**
     * Add a new element and subelements to Setting's menu.
     *
     * The subelements will be transformed in HTML output, and this will be cached via
     * [[Settings.submenu]] element. A global event will be associated with the newly
     * added elements.
     *
     * @param {string} name  The name of the Settings element.
     * @param {string} key  Identifier to generate unique Settings' items and subitems.
     * @param {string} defaultValue  It can represent a number or a string.
     * @param {?SettingsSubItem[]} submenu  A collection of subitems.
     * @param {?string} className  A specific class to trigger events on submenu items.
     * @memberof Settings
     */
    public addItem(name: string, key: string, defaultValue: string, submenu?: SettingsSubItem[], className?: string): void {
        // Build the menu entry first
        const menuItem = document.createElement('div');
        menuItem.className = 'op-settings__menu-item';
        menuItem.tabIndex = 0;
        menuItem.setAttribute('role', 'menuitemradio');
        menuItem.innerHTML = `<div class="op-settings__menu-label" data-value="${key}-${defaultValue}">${name}</div>
            <div class="op-settings__menu-content">${submenu.find(x => x.key === defaultValue).label}</div>`;

        this.menu.querySelector('.op-settings__menu').appendChild(menuItem);
        this.originalOutput = this.menu.innerHTML;

        // Store the submenu to reach all options for current menu item
        if (submenu) {
            const subItems = `
                <div class="op-settings__header">
                    <button type="button" class="op-settings__back">${name}</button>
                </div>
                <div class="op-settings__menu" role="menu" id="menu-item-${key}">
                    ${submenu.map((item: SettingsSubItem) => `
                    <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio"
                        aria-checked="${defaultValue === item.key ? 'true' : 'false'}">
                        <div class="op-settings__submenu-label ${className || ''}" data-value="${key}-${item.key}">${item.label}</div>
                    </div>`).join('')}
                </div>`;
            this.submenu[key] = subItems;
        }

        this.events.global['settings.submenu'] = (e: Event) => {
            const target = (e.target as HTMLElement);
            if (target.closest(`#${this.player.id}`)) {
                if (hasClass(target, 'op-settings__back')) {
                    this.menu.classList.add('op-settings--sliding');
                    setTimeout(() => {
                        this.menu.innerHTML = this.originalOutput;
                        this.menu.classList.remove('op-settings--sliding');
                    }, 100);
                } else if (hasClass(target, 'op-settings__menu-content')) {
                    const fragments = target.parentElement.querySelector('.op-settings__menu-label')
                        .getAttribute('data-value').split('-');
                    fragments.pop();
                    const current = fragments.join('-').replace(/^\-|\-$/, '');

                    if (typeof this.submenu[current] !== undefined) {
                        this.menu.classList.add('op-settings--sliding');
                        setTimeout(() => {
                            this.menu.innerHTML = this.submenu[current];
                            this.menu.classList.remove('op-settings--sliding');
                        }, 100);
                    }
                } else if (hasClass(target, 'op-settings__submenu-label')) {
                    const current = target.getAttribute('data-value');
                    const value = current.replace(`${key}-`, '');
                    const label = target.innerText;

                    // Update values in submenu and store
                    const menuTarget = this.menu.querySelector(`#menu-item-${key} .op-settings__submenu-item[aria-checked=true]`);
                    if (menuTarget) {
                        menuTarget.setAttribute('aria-checked', 'false');
                        target.parentElement.setAttribute('aria-checked', 'true');
                        this.submenu[key] = this.menu.innerHTML;

                        // Restore original menu, and set the new value
                        this.menu.classList.add('op-settings--sliding');
                        setTimeout(() => {
                            this.menu.innerHTML = this.originalOutput;
                            const prev = this.menu.querySelector(`.op-settings__menu-label[data-value="${key}-${defaultValue}"]`);
                            prev.setAttribute('data-value', `${current}`);
                            prev.nextElementSibling.innerHTML = label;
                            defaultValue = value;
                            this.originalOutput = this.menu.innerHTML;
                            this.menu.classList.remove('op-settings--sliding');
                        }, 100);
                    }
                }
            } else {
                this.hideEvent();
            }
        };

        document.addEventListener('click', this.events.global['settings.submenu']);
        this.player.getElement().addEventListener('controlshidden', this.hideEvent);
    }

    /**
     *
     *
     * @param {(string|number)} id
     * @param {string} type
     * @param {number} [minItems=2]
     * @memberof Settings
     */
    public removeItem(id: string|number, type: string, minItems: number = 2) {
        const target = this.player.getElement().querySelector(`.op-settings__submenu-label[data-value=${type}-${id}]`);
        if (target) {
            removeElement(target);
        }

        if (this.player.getElement().querySelectorAll(`.op-settings__submenu-label[data-value^=${type}]`).length < minItems) {
            delete this.submenu[type];
            removeElement(this.player.getElement().querySelector(`.op-settings__menu-label[data-value^=${type}]`)
                .closest('.op-settings__menu-item'));
        }
    }
}

export default Settings;
