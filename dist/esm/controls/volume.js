var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Volume_player, _Volume_button, _Volume_container, _Volume_display, _Volume_slider, _Volume_events, _Volume_volume, _Volume_labels, _Volume_position, _Volume_layer;
import { EVENT_OPTIONS, IS_ANDROID, IS_IOS } from '../utils/constants';
import { addEvent } from '../utils/events';
import { isAudio, removeElement } from '../utils/general';
class Volume {
    constructor(player, position, layer) {
        _Volume_player.set(this, void 0);
        _Volume_button.set(this, void 0);
        _Volume_container.set(this, void 0);
        _Volume_display.set(this, void 0);
        _Volume_slider.set(this, void 0);
        _Volume_events.set(this, {
            button: {},
            media: {},
            slider: {},
        });
        _Volume_volume.set(this, void 0);
        _Volume_labels.set(this, void 0);
        _Volume_position.set(this, void 0);
        _Volume_layer.set(this, void 0);
        __classPrivateFieldSet(this, _Volume_player, player, "f");
        __classPrivateFieldSet(this, _Volume_labels, player.getOptions().labels, "f");
        __classPrivateFieldSet(this, _Volume_volume, __classPrivateFieldGet(this, _Volume_player, "f").getMedia().volume, "f");
        __classPrivateFieldSet(this, _Volume_position, position, "f");
        __classPrivateFieldSet(this, _Volume_layer, layer, "f");
        return this;
    }
    create() {
        __classPrivateFieldSet(this, _Volume_container, document.createElement('div'), "f");
        __classPrivateFieldGet(this, _Volume_container, "f").className = `op-controls__volume op-control__${__classPrivateFieldGet(this, _Volume_position, "f")}`;
        __classPrivateFieldGet(this, _Volume_container, "f").tabIndex = 0;
        __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-valuemin', '0');
        __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-valuemax', '100');
        __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-valuenow', `${__classPrivateFieldGet(this, _Volume_volume, "f")}`);
        __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-valuetext', `${__classPrivateFieldGet(this, _Volume_labels, "f").volume}: ${__classPrivateFieldGet(this, _Volume_volume, "f")}`);
        __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-orientation', 'vertical');
        __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-label', __classPrivateFieldGet(this, _Volume_labels, "f").volumeSlider);
        __classPrivateFieldSet(this, _Volume_slider, document.createElement('input'), "f");
        __classPrivateFieldGet(this, _Volume_slider, "f").type = 'range';
        __classPrivateFieldGet(this, _Volume_slider, "f").className = 'op-controls__volume--input';
        __classPrivateFieldGet(this, _Volume_slider, "f").tabIndex = -1;
        __classPrivateFieldGet(this, _Volume_slider, "f").value = __classPrivateFieldGet(this, _Volume_player, "f").getMedia().volume.toString();
        __classPrivateFieldGet(this, _Volume_slider, "f").setAttribute('min', '0');
        __classPrivateFieldGet(this, _Volume_slider, "f").setAttribute('max', '1');
        __classPrivateFieldGet(this, _Volume_slider, "f").setAttribute('step', '0.1');
        __classPrivateFieldGet(this, _Volume_slider, "f").setAttribute('aria-label', __classPrivateFieldGet(this, _Volume_labels, "f").volumeControl);
        __classPrivateFieldSet(this, _Volume_display, document.createElement('progress'), "f");
        __classPrivateFieldGet(this, _Volume_display, "f").className = 'op-controls__volume--display';
        __classPrivateFieldGet(this, _Volume_display, "f").setAttribute('max', '10');
        __classPrivateFieldGet(this, _Volume_display, "f").setAttribute('role', 'presentation');
        __classPrivateFieldGet(this, _Volume_display, "f").value = __classPrivateFieldGet(this, _Volume_player, "f").getMedia().volume * 10;
        __classPrivateFieldGet(this, _Volume_container, "f").appendChild(__classPrivateFieldGet(this, _Volume_slider, "f"));
        __classPrivateFieldGet(this, _Volume_container, "f").appendChild(__classPrivateFieldGet(this, _Volume_display, "f"));
        __classPrivateFieldSet(this, _Volume_button, document.createElement('button'), "f");
        __classPrivateFieldGet(this, _Volume_button, "f").type = 'button';
        __classPrivateFieldGet(this, _Volume_button, "f").className = `op-controls__mute op-control__${__classPrivateFieldGet(this, _Volume_position, "f")}`;
        __classPrivateFieldGet(this, _Volume_button, "f").tabIndex = 0;
        __classPrivateFieldGet(this, _Volume_button, "f").title = __classPrivateFieldGet(this, _Volume_labels, "f").mute;
        __classPrivateFieldGet(this, _Volume_button, "f").setAttribute('aria-controls', __classPrivateFieldGet(this, _Volume_player, "f").id);
        __classPrivateFieldGet(this, _Volume_button, "f").setAttribute('aria-pressed', 'false');
        __classPrivateFieldGet(this, _Volume_button, "f").setAttribute('aria-label', __classPrivateFieldGet(this, _Volume_labels, "f").mute);
        __classPrivateFieldGet(this, _Volume_button, "f").innerHTML = `<span class="op-sr">${__classPrivateFieldGet(this, _Volume_labels, "f").mute}</span>`;
        const updateSlider = (element) => {
            const mediaVolume = element.volume * 1;
            const vol = Math.floor(mediaVolume * 100);
            __classPrivateFieldGet(this, _Volume_slider, "f").value = `${element.volume}`;
            __classPrivateFieldGet(this, _Volume_display, "f").value = (mediaVolume * 10);
            __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-valuenow', `${vol}`);
            __classPrivateFieldGet(this, _Volume_container, "f").setAttribute('aria-valuetext', `${__classPrivateFieldGet(this, _Volume_labels, "f").volume}: ${vol}`);
        };
        const updateButton = (element) => {
            const vol = element.volume;
            if (vol <= 0.5 && vol > 0) {
                __classPrivateFieldGet(this, _Volume_button, "f").classList.remove('op-controls__mute--muted');
                __classPrivateFieldGet(this, _Volume_button, "f").classList.add('op-controls__mute--half');
            }
            else if (vol === 0) {
                __classPrivateFieldGet(this, _Volume_button, "f").classList.add('op-controls__mute--muted');
                __classPrivateFieldGet(this, _Volume_button, "f").classList.remove('op-controls__mute--half');
            }
            else {
                __classPrivateFieldGet(this, _Volume_button, "f").classList.remove('op-controls__mute--muted');
                __classPrivateFieldGet(this, _Volume_button, "f").classList.remove('op-controls__mute--half');
            }
        };
        const updateVolume = (event) => {
            const el = __classPrivateFieldGet(this, _Volume_player, "f").activeElement();
            const value = parseFloat(event.target.value);
            el.volume = value;
            el.muted = (el.volume === 0);
            __classPrivateFieldSet(this, _Volume_volume, value, "f");
            const unmuteEl = __classPrivateFieldGet(this, _Volume_player, "f").getContainer().querySelector('.op-player__unmute');
            if (!el.muted && unmuteEl) {
                removeElement(unmuteEl);
            }
            const e = addEvent('volumechange');
            __classPrivateFieldGet(this, _Volume_player, "f").getElement().dispatchEvent(e);
        };
        __classPrivateFieldGet(this, _Volume_events, "f").media.volumechange = () => {
            const el = __classPrivateFieldGet(this, _Volume_player, "f").activeElement();
            updateSlider(el);
            updateButton(el);
        };
        __classPrivateFieldGet(this, _Volume_events, "f").media.timeupdate = () => {
            if (isAudio(__classPrivateFieldGet(this, _Volume_player, "f").getElement()) && (__classPrivateFieldGet(this, _Volume_player, "f").activeElement().duration === Infinity ||
                __classPrivateFieldGet(this, _Volume_player, "f").getElement().getAttribute('op-live__enabled'))) {
            }
        };
        __classPrivateFieldGet(this, _Volume_events, "f").media.loadedmetadata = () => {
            const el = __classPrivateFieldGet(this, _Volume_player, "f").activeElement();
            if (el.muted) {
                el.volume = 0;
            }
            const e = addEvent('volumechange');
            __classPrivateFieldGet(this, _Volume_player, "f").getElement().dispatchEvent(e);
        };
        __classPrivateFieldGet(this, _Volume_events, "f").slider.input = updateVolume.bind(this);
        __classPrivateFieldGet(this, _Volume_events, "f").slider.change = updateVolume.bind(this);
        __classPrivateFieldGet(this, _Volume_events, "f").button.click = () => {
            __classPrivateFieldGet(this, _Volume_button, "f").setAttribute('aria-pressed', 'true');
            const el = __classPrivateFieldGet(this, _Volume_player, "f").activeElement();
            el.muted = !el.muted;
            if (el.muted) {
                el.volume = 0;
                __classPrivateFieldGet(this, _Volume_button, "f").title = __classPrivateFieldGet(this, _Volume_labels, "f").unmute;
                __classPrivateFieldGet(this, _Volume_button, "f").setAttribute('aria-label', __classPrivateFieldGet(this, _Volume_labels, "f").unmute);
            }
            else {
                el.volume = __classPrivateFieldGet(this, _Volume_volume, "f");
                __classPrivateFieldGet(this, _Volume_button, "f").title = __classPrivateFieldGet(this, _Volume_labels, "f").mute;
                __classPrivateFieldGet(this, _Volume_button, "f").setAttribute('aria-label', __classPrivateFieldGet(this, _Volume_labels, "f").mute);
            }
            const event = addEvent('volumechange');
            __classPrivateFieldGet(this, _Volume_player, "f").getElement().dispatchEvent(event);
        };
        __classPrivateFieldGet(this, _Volume_button, "f").addEventListener('click', __classPrivateFieldGet(this, _Volume_events, "f").button.click, EVENT_OPTIONS);
        Object.keys(__classPrivateFieldGet(this, _Volume_events, "f").media).forEach(event => {
            __classPrivateFieldGet(this, _Volume_player, "f").getElement().addEventListener(event, __classPrivateFieldGet(this, _Volume_events, "f").media[event], EVENT_OPTIONS);
        });
        Object.keys(__classPrivateFieldGet(this, _Volume_events, "f").slider).forEach(event => {
            __classPrivateFieldGet(this, _Volume_slider, "f").addEventListener(event, __classPrivateFieldGet(this, _Volume_events, "f").slider[event], EVENT_OPTIONS);
        });
        __classPrivateFieldGet(this, _Volume_player, "f").getContainer().addEventListener('keydown', this._keydownEvent.bind(this), EVENT_OPTIONS);
        if (!IS_ANDROID && !IS_IOS) {
            const controls = __classPrivateFieldGet(this, _Volume_player, "f").getControls().getLayer(__classPrivateFieldGet(this, _Volume_layer, "f"));
            controls.appendChild(__classPrivateFieldGet(this, _Volume_button, "f"));
            controls.appendChild(__classPrivateFieldGet(this, _Volume_container, "f"));
        }
    }
    destroy() {
        __classPrivateFieldGet(this, _Volume_button, "f").removeEventListener('click', __classPrivateFieldGet(this, _Volume_events, "f").button.click);
        Object.keys(__classPrivateFieldGet(this, _Volume_events, "f").media).forEach(event => {
            __classPrivateFieldGet(this, _Volume_player, "f").getElement().removeEventListener(event, __classPrivateFieldGet(this, _Volume_events, "f").media[event]);
        });
        Object.keys(__classPrivateFieldGet(this, _Volume_events, "f").slider).forEach(event => {
            __classPrivateFieldGet(this, _Volume_slider, "f").removeEventListener(event, __classPrivateFieldGet(this, _Volume_events, "f").slider[event]);
        });
        __classPrivateFieldGet(this, _Volume_player, "f").getContainer().removeEventListener('keydown', this._keydownEvent.bind(this));
        removeElement(__classPrivateFieldGet(this, _Volume_slider, "f"));
        removeElement(__classPrivateFieldGet(this, _Volume_display, "f"));
        removeElement(__classPrivateFieldGet(this, _Volume_container, "f"));
    }
    _keydownEvent(e) {
        const key = e.which || e.keyCode || 0;
        const el = __classPrivateFieldGet(this, _Volume_player, "f").activeElement();
        if (key === 38 || key === 40) {
            const newVol = key === 38 ? Math.min(el.volume + 0.1, 1) : Math.max(el.volume - 0.1, 0);
            el.volume = newVol;
            el.muted = !(newVol > 0);
            e.preventDefault();
        }
    }
}
_Volume_player = new WeakMap(), _Volume_button = new WeakMap(), _Volume_container = new WeakMap(), _Volume_display = new WeakMap(), _Volume_slider = new WeakMap(), _Volume_events = new WeakMap(), _Volume_volume = new WeakMap(), _Volume_labels = new WeakMap(), _Volume_position = new WeakMap(), _Volume_layer = new WeakMap();
export default Volume;
