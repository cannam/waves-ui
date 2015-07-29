'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _objectDestructuringEmpty = require('babel-runtime/helpers/object-destructuring-empty')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _interactionsKeyboard = require('../interactions/keyboard');

var _interactionsKeyboard2 = _interopRequireDefault(_interactionsKeyboard);

var _layerTimeContext = require('./layer-time-context');

var _layerTimeContext2 = _interopRequireDefault(_layerTimeContext);

var _interactionsSurface = require('../interactions/surface');

var _interactionsSurface2 = _interopRequireDefault(_interactionsSurface);

var _timelineTimeContext = require('./timeline-time-context');

var _timelineTimeContext2 = _interopRequireDefault(_timelineTimeContext);

var _track2 = require('./track');

var _track3 = _interopRequireDefault(_track2);

var _trackCollection = require('./track-collection');

var _trackCollection2 = _interopRequireDefault(_trackCollection);

/**
 * The `timeline` is the main entry point of a temporal visualization, it:
 * - contains factories to manage its `tracks` and `layers`,
 * - get or set the view window overs its `tracks` through `offset`, `zoom`,  * `pixelsPerSecond`, `visibleWidth`,
 * - is the central hub for all user interaction events (keyboard, mouse),
 * - holds the current interaction `state` which defines how the different timeline elements (tracks, layers, shapes) respond to user interactions.
 */

var Timeline = (function (_events$EventEmitter) {
  /**
   * Creates a new `Timeline` instance
   */

  function Timeline() {
    var pixelsPerSecond = arguments[0] === undefined ? 100 : arguments[0];
    var visibleWidth = arguments[1] === undefined ? 1000 : arguments[1];

    var _ref = arguments[2] === undefined ? {} : arguments[2];

    _objectDestructuringEmpty(_ref);

    _classCallCheck(this, Timeline);

    _get(Object.getPrototypeOf(Timeline.prototype), 'constructor', this).call(this);

    this._tracks = new _trackCollection2['default'](this);
    this._state = null;

    // default interactions
    this._surfaceCtor = _interactionsSurface2['default'];

    var that = this;

    function registerKeyboard() {
      that.createInteraction(_interactionsKeyboard2['default'], document.body);
      document.removeEventListener('DOMContentLoaded', registerKeyboard);
    }

    document.addEventListener('DOMContentLoaded', registerKeyboard, false);

    // stores
    this._trackById = {};
    this._groupedLayers = {};

    this.timeContext = new _timelineTimeContext2['default'](pixelsPerSecond, visibleWidth);
  }

  _inherits(Timeline, _events$EventEmitter);

  _createClass(Timeline, [{
    key: 'offset',

    /**
     *  TimeContext accessors
     */
    get: function () {
      return this.timeContext.offset;
    },
    set: function (value) {
      this.timeContext.offset = value;
    }
  }, {
    key: 'zoom',
    get: function () {
      return this.timeContext.zoom;
    },
    set: function (value) {
      this.timeContext.zoom = value;
    }
  }, {
    key: 'pixelsPerSecond',
    get: function () {
      return this.timeContext.pixelsPerSecond;
    },
    set: function (value) {
      this.timeContext.pixelsPerSecond = value;
    }
  }, {
    key: 'visibleWidth',
    get: function () {
      return this.timeContext.visibleWidth;
    },
    set: function (value) {
      this.timeContext.visibleWidth = value;
    }
  }, {
    key: 'timeToPixel',
    get: function () {
      return this.timeContext.timeToPixel;
    }
  }, {
    key: 'visibleDuration',

    /**
     *  @readonly
     */
    get: function () {
      return this.timeContext.visibleDuration;
    }
  }, {
    key: 'maintainVisibleDuration',

    // @NOTE maybe expose as public instead of get/set for nothing...
    set: function (bool) {
      this.timeContext.maintainVisibleDuration = bool;
    },
    get: function () {
      return this.timeContext.maintainVisibleDuration;
    }
  }, {
    key: 'groupedLayers',

    // @readonly - used in track collection
    get: function () {
      return this._groupedLayers;
    }
  }, {
    key: 'configureSurface',

    /**
     *  Override the default Surface that is instanciated on each
     *  @param {EventSource} ctor - the constructor to use to build surfaces
     */
    value: function configureSurface(ctor) {
      this._surfaceCtor = ctor;
    }
  }, {
    key: 'createInteraction',

    /**
     * Factory method to add interaction modules the timeline should listen to.
     * By default, the timeline listen to Keyboard, and instanciate a `Surface` on each container.
     * Can be used to install any interaction implementing the `EventSource` interface
     * @param {EventSource} ctor - the contructor of the interaction module to instanciate
     * @param el {DOMElement} the DOM element to bind to the EventSource module
     * @param options {Object} options to be applied to the ctor (defaults to `{}`)
     */
    value: function createInteraction(ctor, el) {
      var _this = this;

      var options = arguments[2] === undefined ? {} : arguments[2];

      var interaction = new ctor(el, options);
      interaction.on('event', function (e) {
        return _this._handleEvent(e);
      });
    }
  }, {
    key: '_handleEvent',

    /**
     * The callback that is used to listen to interactions modules
     * @params {Event} e - a custom event generated by interaction modules
     */
    value: function _handleEvent(e) {
      // emit event as a middleware
      this.emit('event', e);
      // propagate to the state
      if (!this._state) {
        return;
      }
      this._state.handleEvent(e);
    }
  }, {
    key: 'state',

    /**
     * Changes the state of the timeline
     * @param {BaseState} state - the state in which the timeline must be setted
     */
    set: function (state) {
      if (this._state) {
        this._state.exit();
      }
      this._state = state;
      this._state.enter();
    },
    get: function () {
      return this._state;
    }
  }, {
    key: 'tracks',

    /**
     *  Shortcut to access the Track collection
     *  @return {TrackCollection}
     */
    get: function () {
      return this._tracks;
    }
  }, {
    key: 'layers',

    /**
     * Shortcut to access the Layer list
     * @return {Array}
     */
    get: function () {
      return this._tracks.layers;
    }
  }, {
    key: 'add',

    /**
     * Adds a track to the timeline
     * Tracks display a view window on the timeline in theirs own SVG element.
     * @param {Track} track
     */
    value: function add(track) {
      if (this.tracks.indexOf(track) !== -1) {
        throw new Error('track already added to the timeline');
      }

      track.configure(this.timeContext);

      this.tracks.push(track);
      this.createInteraction(this._surfaceCtor, track.$el);
    }
  }, {
    key: 'remove',

    /**
     *  Removes a track from the timeline
     *  @TODO
     */
    value: function remove(track) {}
  }, {
    key: 'createTrack',

    /**
     *  Creates a new track from the configuration define in `configureTracks`
     *  @param {DOMElement} $el - the element to insert the track inside
     *  @param {Object} options - override the defaults options if necessary
     *  @param {String} [trackId=null] - optionnal id to give to the track, only exists in timeline's context
     *  @return {Track}
     */
    value: function createTrack($el) {
      var trackHeight = arguments[1] === undefined ? 100 : arguments[1];
      var trackId = arguments[2] === undefined ? null : arguments[2];

      var track = new _track3['default']($el, trackHeight);

      if (trackId !== null) {
        if (this._trackById[trackId] !== undefined) {
          throw new Error('trackId: "' + trackId + '" is already used');
        }

        this._trackById[trackId] = track;
      }

      // Add track to the timeline
      this.add(track);
      track.render();
      track.update();

      return track;
    }
  }, {
    key: 'addLayer',

    /**
     *  Adds a layer to a track, allow to group track arbitrarily inside groups. Basically a wrapper for `track.add(layer)`
     *  @param {Layer} layer - the layer to add
     *  @param {Track} track - the track to the insert the layer in
     *  @param {String} [groupId='default'] - the group in which associate the layer
     */
    value: function addLayer(layer, trackOrTrackId) {
      var groupId = arguments[2] === undefined ? 'default' : arguments[2];

      var track = trackOrTrackId;

      if (typeof trackOrTrackId === 'string') {
        track = this.getTrackById(trackOrTrackId);
      }

      // creates the `LayerTimeContext` if not present
      if (!layer.timeContext) {
        var timeContext = new _layerTimeContext2['default'](this.timeContext);
        layer.setTimeContext(timeContext);
      }

      // we should have a Track instance at this point
      track.add(layer);

      if (!this._groupedLayers[groupId]) {
        this._groupedLayers[groupId] = [];
      }

      this._groupedLayers[groupId].push(layer);

      layer.render();
      layer.update();
    }
  }, {
    key: 'removeLayer',

    /**
     *  Removes a layer from its track (the layer is detatched from the DOM but can still be reused)
     *  @param {Layer} layer - the layer to remove
     */
    value: function removeLayer(layer) {
      this.tracks.forEach(function (track) {
        var index = track.layers.indexOf(layer);
        if (index !== -1) {
          track.remove(layer);
        }
      });

      // clean references in helpers
      for (var groupId in this._groupedLayers) {
        var group = this._groupedLayers[groupId];
        var index = group.indexOf(layer);

        if (index !== -1) {
          group.splice(layer, 1);
        }

        if (!group.length) {
          delete this._groupedLayers[groupId];
        }
      }
    }
  }, {
    key: 'getTrackById',

    /**
     *  Returns a track from it's id
     *  @param {String} trackId
     *  @return {Track}
     */
    value: function getTrackById(trackId) {
      return this._trackById[trackId];
    }
  }, {
    key: 'getTrackFromDOMElement',

    /**
     *  Returns the track containing a given DOM Element, if no match found return null
     *  @param {DOMElement} $el
     *  @return {Track|null}
     */
    value: function getTrackFromDOMElement($el) {
      var $svg = null;
      var track = null;
      // find the closest `.track` element
      do {
        if ($el.classList.contains('track')) {
          $svg = $el;
        }
        $el = $el.parentNode;
      } while ($svg === null);
      // find the related `Track`
      this.tracks.forEach(function (_track) {
        if (_track.$svg === $svg) {
          track = _track;
        }
      });

      return track;
    }
  }, {
    key: 'getLayersByGroup',

    /**
     * Returns an array of layers from their group Id
     * @param {String} groupId
     * @return {Array}
     */
    value: function getLayersByGroup(groupId) {
      return this._groupedLayers[groupId];
    }
  }, {
    key: _Symbol$iterator,
    value: _regeneratorRuntime.mark(function callee$1$0() {
      return _regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            return context$2$0.delegateYield(_getIterator(this.tracks), 't0', 1);

          case 1:
          case 'end':
            return context$2$0.stop();
        }
      }, callee$1$0, this);
    })
  }]);

  return Timeline;
})(_events2['default'].EventEmitter);

exports['default'] = Timeline;
module.exports = exports['default'];

// should destroy interaction too, avoid ghost eventListeners
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9jb3JlL3RpbWVsaW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQUFtQixRQUFROzs7O29DQUVOLDBCQUEwQjs7OztnQ0FDbEIsc0JBQXNCOzs7O21DQUMvQix5QkFBeUI7Ozs7bUNBQ2IseUJBQXlCOzs7O3NCQUN2QyxTQUFTOzs7OytCQUNDLG9CQUFvQjs7Ozs7Ozs7Ozs7O0lBVTNCLFFBQVE7Ozs7O0FBSWhCLFdBSlEsUUFBUSxHQUlzQztRQUFyRCxlQUFlLGdDQUFHLEdBQUc7UUFBRSxZQUFZLGdDQUFHLElBQUk7OzRDQUFPLEVBQUU7Ozs7MEJBSjVDLFFBQVE7O0FBS3pCLCtCQUxpQixRQUFRLDZDQUtqQjs7QUFFUixRQUFJLENBQUMsT0FBTyxHQUFHLGlDQUFvQixJQUFJLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7O0FBR25CLFFBQUksQ0FBQyxZQUFZLG1DQUFVLENBQUM7O0FBRTVCLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsYUFBUyxnQkFBZ0IsR0FBRztBQUMxQixVQUFJLENBQUMsaUJBQWlCLG9DQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRCxjQUFRLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUNwRTs7QUFFRCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7OztBQUd2RSxRQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQzs7QUFFekIsUUFBSSxDQUFDLFdBQVcsR0FBRyxxQ0FBd0IsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO0dBQzNFOztZQTNCa0IsUUFBUTs7ZUFBUixRQUFROzs7Ozs7U0FnQ2pCLFlBQUc7QUFDWCxhQUFPLElB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O0FBQ2pCLGlCQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDckM7T0FDRjtLQUNGOzs7Ozs7Ozs7V0FPVyxzQkFBQyxPQUFPLEVBQUU7QUFDcEIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2pDOzs7Ozs7Ozs7V0FPcUIsZ0NBQUMsR0FBRyxFQUFFO0FBQzFCLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7O0FBRWpCLFNBQUc7QUFDRCxZQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ25DLGNBQUksR0FBRyxHQUFHLENBQUM7U0FDWjtBQUNELFdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO09BQ3RCLFFBQVEsSUFBSSxLQUFLLElBQUksRUFBRTs7QUFFeEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBUyxNQUFNLEVBQUU7QUFDbkMsWUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUFFLGVBQUssR0FBRyxNQUFNLENBQUM7U0FBRTtPQUM5QyxDQUFDLENBQUM7O0FBRUgsYUFBTyxLQUFLLENBQUM7S0FDZDs7Ozs7Ozs7O1dBT2UsMEJBQUMsT0FBTyxFQUFFO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyQzs7O29DQUVpQjs7OzswREFDVCxJQUFJLENBQUMsTUFBTTs7Ozs7OztLQUNuQjs7O1NBN1NrQixRQUFRO0dBQVMsb0JBQU8sWUFBWTs7cUJBQXBDLFFBQVEiLCJmaWxlIjoiZXM2L2NvcmUvdGltZWxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXZlbnRzIGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCBLZXlib2FyZCBmcm9tICcuLi9pbnRlcmFjdGlvbnMva2V5Ym9hcmQnO1xuaW1wb3J0IExheWVyVGltZUNvbnRleHQgZnJvbSAnLi9sYXllci10aW1lLWNvbnRleHQnO1xuaW1wb3J0IFN1cmZhY2UgZnJvbSAnLi4vaW50ZXJhY3Rpb25zL3N1cmZhY2UnO1xuaW1wb3J0IFRpbWVsaW5lVGltZUNvbnRleHQgZnJvbSAnLi90aW1lbGluZS10aW1lLWNvbnRleHQnO1xuaW1wb3J0IFRyYWNrIGZyb20gJy4vdHJhY2snO1xuaW1wb3J0IFRyYWNrQ29sbGVjdGlvbiBmcm9tICcuL3RyYWNrLWNvbGxlY3Rpb24nO1xuXG5cbi8qKlxuICogVGhlIGB0aW1lbGluZWAgaXMgdGhlIG1haW4gZW50cnkgcG9pbnQgb2YgYSB0ZW1wb3JhbCB2aXN1YWxpemF0aW9uLCBpdDpcbiAqIC0gY29udGFpbnMgZmFjdG9yaWVzIHRvIG1hbmFnZSBpdHMgYHRyYWNrc2AgYW5kIGBsYXllcnNgLFxuICogLSBnZXQgb3Igc2V0IHRoZSB2aWV3IHdpbmRvdyBvdmVycyBpdHMgYHRyYWNrc2AgdGhyb3VnaCBgb2Zmc2V0YCwgYHpvb21gLCAgKiBgcGl4ZWxzUGVyU2Vjb25kYCwgYHZpc2libGVXaWR0aGAsXG4gKiAtIGlzIHRoZSBjZW50cmFsIGh1YiBmb3IgYWxsIHVzZXIgaW50ZXJhY3Rpb24gZXZlbnRzIChrZXlib2FyZCwgbW91c2UpLFxuICogLSBob2xkcyB0aGUgY3VycmVudCBpbnRlcmFjdGlvbiBgc3RhdGVgIHdoaWNoIGRlZmluZXMgaG93IHRoZSBkaWZmZXJlbnQgdGltZWxpbmUgZWxlbWVudHMgKHRyYWNrcywgbGF5ZXJzLCBzaGFwZXMpIHJlc3BvbmQgdG8gdXNlciBpbnRlcmFjdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVsaW5lIGV4dGVuZHMgZXZlbnRzLkV2ZW50RW1pdHRlciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBUaW1lbGluZWAgaW5zdGFuY2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBpeGVsc1BlclNlY29uZCA9IDEwMCwgdmlzaWJsZVdpZHRoID0gMTAwMCwge30gPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl90cmFja3MgPSBuZXcgVHJhY2tDb2xsZWN0aW9uKHRoaXMpO1xuICAgIHRoaXMuX3N0YXRlID0gbnVsbDtcblxuICAgIC8vIGRlZmF1bHQgaW50ZXJhY3Rpb25zXG4gICAgdGhpcy5fc3VyZmFjZUN0b3IgPSBTdXJmYWNlO1xuXG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiByZWdpc3RlcktleWJvYXJkKCkge1xuICAgICAgdGhhdC5jcmVhdGVJbnRlcmFjdGlvbihLZXlib2FyZCwgZG9jdW1lbnQuYm9keSk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcmVnaXN0ZXJLZXlib2FyZCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJlZ2lzdGVyS2V5Ym9hcmQsIGZhbHNlKTtcblxuICAgIC8vIHN0b3Jlc1xuICAgIHRoaXMuX3RyYWNrQnlJZCA9IHt9O1xuICAgIHRoaXMuX2dyb3VwZWRMYXllcnMgPSB7fTtcblxuICAgIHRoaXMudGltZUNvbnRleHQgPSBuZXcgVGltZWxpbmVUaW1lQ29udGV4dChwaXhlbHNQZXJTZWNvbmQsIHZpc2libGVXaWR0aCk7XG4gIH1cblxuICAvKipcbiAgICogIFRpbWVDb250ZXh0IGFjY2Vzc29yc1xuICAgKi9cbiAgZ2V0IG9mZnNldCgpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lQ29udGV4dC5vZmZzZXQ7XG4gIH1cblxuICBzZXQgb2Zmc2V0KHZhbHVlKSB7XG4gICAgdGhpcy50aW1lQ29udGV4dC5vZmZzZXQgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCB6b29tKCkge1xuICAgIHJldHVybiB0aGlzLnRpbWVDb250ZXh0Lnpvb207XG4gIH1cblxuICBzZXQgem9vbSh2YWx1ZSkge1xuICAgIHRoaXMudGltZUNvbnRleHQuem9vbSA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IHBpeGVsc1BlclNlY29uZCgpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lQ29udGV4dC5waXhlbHNQZXJTZWNvbmQ7XG4gIH1cblxuICBzZXQgcGl4ZWxzUGVyU2Vjb25kKHZhbHVlKSB7XG4gICAgdGhpcy50aW1lQ29udGV4dC5waXhlbHNQZXJTZWNvbmQgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCB2aXNpYmxlV2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUNvbnRleHQudmlzaWJsZVdpZHRoO1xuICB9XG5cbiAgc2V0IHZpc2libGVXaWR0aCh2YWx1ZSkge1xuICAgIHRoaXMudGltZUNvbnRleHQudmlzaWJsZVdpZHRoID0gdmFsdWU7XG4gIH1cblxuICBnZXQgdGltZVRvUGl4ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUNvbnRleHQudGltZVRvUGl4ZWw7XG4gIH1cblxuICAvKipcbiAgICogIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IHZpc2libGVEdXJhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lQ29udGV4dC52aXNpYmxlRHVyYXRpb247XG4gIH1cblxuICAvLyBATk9URSBtYXliZSBleHBvc2UgYXMgcHVibGljIGluc3RlYWQgb2YgZ2V0L3NldCBmb3Igbm90aGluZy4uLlxuICBzZXQgbWFpbnRhaW5WaXNpYmxlRHVyYXRpb24oYm9vbCkge1xuICAgIHRoaXMudGltZUNvbnRleHQubWFpbnRhaW5WaXNpYmxlRHVyYXRpb24gPSBib29sO1xuICB9XG5cbiAgZ2V0IG1haW50YWluVmlzaWJsZUR1cmF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRpbWVDb250ZXh0Lm1haW50YWluVmlzaWJsZUR1cmF0aW9uO1xuICB9XG5cbiAgLy8gQHJlYWRvbmx5IC0gdXNlZCBpbiB0cmFjayBjb2xsZWN0aW9uXG4gIGdldCBncm91cGVkTGF5ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9ncm91cGVkTGF5ZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqICBPdmVycmlkZSB0aGUgZGVmYXVsdCBTdXJmYWNlIHRoYXQgaXMgaW5zdGFuY2lhdGVkIG9uIGVhY2hcbiAgICogIEBwYXJhbSB7RXZlbnRTb3VyY2V9IGN0b3IgLSB0aGUgY29uc3RydWN0b3IgdG8gdXNlIHRvIGJ1aWxkIHN1cmZhY2VzXG4gICAqL1xuICBjb25maWd1cmVTdXJmYWNlKGN0b3IpIHtcbiAgICB0aGlzLl9zdXJmYWNlQ3RvciA9IGN0b3I7XG4gIH1cblxuICAvKipcbiAgICogRmFjdG9yeSBtZXRob2QgdG8gYWRkIGludGVyYWN0aW9uIG1vZHVsZXMgdGhlIHRpbWVsaW5lIHNob3VsZCBsaXN0ZW4gdG8uXG4gICAqIEJ5IGRlZmF1bHQsIHRoZSB0aW1lbGluZSBsaXN0ZW4gdG8gS2V5Ym9hcmQsIGFuZCBpbnN0YW5jaWF0ZSBhIGBTdXJmYWNlYCBvbiBlYWNoIGNvbnRhaW5lci5cbiAgICogQ2FuIGJlIHVzZWQgdG8gaW5zdGFsbCBhbnkgaW50ZXJhY3Rpb24gaW1wbGVtZW50aW5nIHRoZSBgRXZlbnRTb3VyY2VgIGludGVyZmFjZVxuICAgKiBAcGFyYW0ge0V2ZW50U291cmNlfSBjdG9yIC0gdGhlIGNvbnRydWN0b3Igb2YgdGhlIGludGVyYWN0aW9uIG1vZHVsZSB0byBpbnN0YW5jaWF0ZVxuICAgKiBAcGFyYW0gZWwge0RPTUVsZW1lbnR9IHRoZSBET00gZWxlbWVudCB0byBiaW5kIHRvIHRoZSBFdmVudFNvdXJjZSBtb2R1bGVcbiAgICogQHBhcmFtIG9wdGlvbnMge09iamVjdH0gb3B0aW9ucyB0byBiZSBhcHBsaWVkIHRvIHRoZSBjdG9yIChkZWZhdWx0cyB0byBge31gKVxuICAgKi9cbiAgY3JlYXRlSW50ZXJhY3Rpb24oY3RvciwgZWwsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGludGVyYWN0aW9uID0gbmV3IGN0b3IoZWwsIG9wdGlvbnMpO1xuICAgIGludGVyYWN0aW9uLm9uKCdldmVudCcsIChlKSA9PiB0aGlzLl9oYW5kbGVFdmVudChlKSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGNhbGxiYWNrIHRoYXQgaXMgdXNlZCB0byBsaXN0ZW4gdG8gaW50ZXJhY3Rpb25zIG1vZHVsZXNcbiAgICogQHBhcmFtcyB7RXZlbnR9IGUgLSBhIGN1c3RvbSBldmVudCBnZW5lcmF0ZWQgYnkgaW50ZXJhY3Rpb24gbW9kdWxlc1xuICAgKi9cbiAgX2hhbmRsZUV2ZW50KGUpIHtcbiAgICAvLyBlbWl0IGV2ZW50IGFzIGEgbWlkZGxld2FyZVxuICAgIHRoaXMuZW1pdCgnZXZlbnQnLCBlKTtcbiAgICAvLyBwcm9wYWdhdGUgdG8gdGhlIHN0YXRlXG4gICAgaWYgKCF0aGlzLl9zdGF0ZSkgeyByZXR1cm47IH1cbiAgICB0aGlzLl9zdGF0ZS5oYW5kbGVFdmVudChlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIHN0YXRlIG9mIHRoZSB0aW1lbGluZVxuICAgKiBAcGFyYW0ge0Jhc2VTdGF0ZX0gc3RhdGUgLSB0aGUgc3RhdGUgaW4gd2hpY2ggdGhlIHRpbWVsaW5lIG11c3QgYmUgc2V0dGVkXG4gICAqL1xuICBzZXQgc3RhdGUoc3RhdGUpIHtcbiAgICBpZiAodGhpcy5fc3RhdGUpIHsgdGhpcy5fc3RhdGUuZXhpdCgpOyB9XG4gICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl9zdGF0ZS5lbnRlcigpO1xuICB9XG5cbiAgZ2V0IHN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgU2hvcnRjdXQgdG8gYWNjZXNzIHRoZSBUcmFjayBjb2xsZWN0aW9uXG4gICAqICBAcmV0dXJuIHtUcmFja0NvbGxlY3Rpb259XG4gICAqL1xuICBnZXQgdHJhY2tzKCkge1xuICAgIHJldHVybiB0aGlzLl90cmFja3M7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRjdXQgdG8gYWNjZXNzIHRoZSBMYXllciBsaXN0XG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0IGxheWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tzLmxheWVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgdHJhY2sgdG8gdGhlIHRpbWVsaW5lXG4gICAqIFRyYWNrcyBkaXNwbGF5IGEgdmlldyB3aW5kb3cgb24gdGhlIHRpbWVsaW5lIGluIHRoZWlycyBvd24gU1ZHIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7VHJhY2t9IHRyYWNrXG4gICAqL1xuICBhZGQodHJhY2spIHtcbiAgICBpZiAodGhpcy50cmFja3MuaW5kZXhPZih0cmFjaykgIT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RyYWNrIGFscmVhZHkgYWRkZWQgdG8gdGhlIHRpbWVsaW5lJyk7XG4gICAgfVxuXG4gICAgdHJhY2suY29uZmlndXJlKHRoaXMudGltZUNvbnRleHQpO1xuXG4gICAgdGhpcy50cmFja3MucHVzaCh0cmFjayk7XG4gICAgdGhpcy5jcmVhdGVJbnRlcmFjdGlvbih0aGlzLl9zdXJmYWNlQ3RvciwgdHJhY2suJGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgUmVtb3ZlcyBhIHRyYWNrIGZyb20gdGhlIHRpbWVsaW5lXG4gICAqICBAVE9ET1xuICAgKi9cbiAgcmVtb3ZlKHRyYWNrKSB7XG4gICAgLy8gc2hvdWxkIGRlc3Ryb3kgaW50ZXJhY3Rpb24gdG9vLCBhdm9pZCBnaG9zdCBldmVudExpc3RlbmVyc1xuICB9XG5cbiAgLyoqXG4gICAqICBDcmVhdGVzIGEgbmV3IHRyYWNrIGZyb20gdGhlIGNvbmZpZ3VyYXRpb24gZGVmaW5lIGluIGBjb25maWd1cmVUcmFja3NgXG4gICAqICBAcGFyYW0ge0RPTUVsZW1lbnR9ICRlbCAtIHRoZSBlbGVtZW50IHRvIGluc2VydCB0aGUgdHJhY2sgaW5zaWRlXG4gICAqICBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIG92ZXJyaWRlIHRoZSBkZWZhdWx0cyBvcHRpb25zIGlmIG5lY2Vzc2FyeVxuICAgKiAgQHBhcmFtIHtTdHJpbmd9IFt0cmFja0lkPW51bGxdIC0gb3B0aW9ubmFsIGlkIHRvIGdpdmUgdG8gdGhlIHRyYWNrLCBvbmx5IGV4aXN0cyBpbiB0aW1lbGluZSdzIGNvbnRleHRcbiAgICogIEByZXR1cm4ge1RyYWNrfVxuICAgKi9cbiAgY3JlYXRlVHJhY2soJGVsLCB0cmFja0hlaWdodCA9IDEwMCwgdHJhY2tJZCA9IG51bGwpIHtcbiAgICBjb25zdCB0cmFjayA9IG5ldyBUcmFjaygkZWwsIHRyYWNrSGVpZ2h0KTtcblxuICAgIGlmICh0cmFja0lkICE9PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5fdHJhY2tCeUlkW3RyYWNrSWRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0cmFja0lkOiBcIiR7dHJhY2tJZH1cIiBpcyBhbHJlYWR5IHVzZWRgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdHJhY2tCeUlkW3RyYWNrSWRdID0gdHJhY2s7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRyYWNrIHRvIHRoZSB0aW1lbGluZVxuICAgIHRoaXMuYWRkKHRyYWNrKTtcbiAgICB0cmFjay5yZW5kZXIoKTtcbiAgICB0cmFjay51cGRhdGUoKTtcblxuICAgIHJldHVybiB0cmFjaztcbiAgfVxuXG4gIC8qKlxuICAgKiAgQWRkcyBhIGxheWVyIHRvIGEgdHJhY2ssIGFsbG93IHRvIGdyb3VwIHRyYWNrIGFyYml0cmFyaWx5IGluc2lkZSBncm91cHMuIEJhc2ljYWxseSBhIHdyYXBwZXIgZm9yIGB0cmFjay5hZGQobGF5ZXIpYFxuICAgKiAgQHBhcmFtIHtMYXllcn0gbGF5ZXIgLSB0aGUgbGF5ZXIgdG8gYWRkXG4gICAqICBAcGFyYW0ge1RyYWNrfSB0cmFjayAtIHRoZSB0cmFjayB0byB0aGUgaW5zZXJ0IHRoZSBsYXllciBpblxuICAgKiAgQHBhcmFtIHtTdHJpbmd9IFtncm91cElkPSdkZWZhdWx0J10gLSB0aGUgZ3JvdXAgaW4gd2hpY2ggYXNzb2NpYXRlIHRoZSBsYXllclxuICAgKi9cbiAgYWRkTGF5ZXIobGF5ZXIsIHRyYWNrT3JUcmFja0lkLCBncm91cElkID0gJ2RlZmF1bHQnKSB7XG4gICAgbGV0IHRyYWNrID0gdHJhY2tPclRyYWNrSWQ7XG5cbiAgICBpZiAodHlwZW9mIHRyYWNrT3JUcmFja0lkID09PSAnc3RyaW5nJykge1xuICAgICAgdHJhY2sgPSB0aGlzLmdldFRyYWNrQnlJZCh0cmFja09yVHJhY2tJZCk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlcyB0aGUgYExheWVyVGltZUNvbnRleHRgIGlmIG5vdCBwcmVzZW50XG4gICAgaWYgKCFsYXllci50aW1lQ29udGV4dCkge1xuICAgICAgY29uc3QgdGltZUNvbnRleHQgPSBuZXcgTGF5ZXJUaW1lQ29udGV4dCh0aGlzLnRpbWVDb250ZXh0KTtcbiAgICAgIGxheWVyLnNldFRpbWVDb250ZXh0KHRpbWVDb250ZXh0KTtcbiAgICB9XG5cbiAgICAvLyB3ZSBzaG91bGQgaGF2ZSBhIFRyYWNrIGluc3RhbmNlIGF0IHRoaXMgcG9pbnRcbiAgICB0cmFjay5hZGQobGF5ZXIpO1xuXG4gICAgaWYgKCF0aGlzLl9ncm91cGVkTGF5ZXJzW2dyb3VwSWRdKSB7XG4gICAgICB0aGlzLl9ncm91cGVkTGF5ZXJzW2dyb3VwSWRdID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5fZ3JvdXBlZExheWVyc1tncm91cElkXS5wdXNoKGxheWVyKTtcblxuICAgIGxheWVyLnJlbmRlcigpO1xuICAgIGxheWVyLnVwZGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqICBSZW1vdmVzIGEgbGF5ZXIgZnJvbSBpdHMgdHJhY2sgKHRoZSBsYXllciBpcyBkZXRhdGNoZWQgZnJvbSB0aGUgRE9NIGJ1dCBjYW4gc3RpbGwgYmUgcmV1c2VkKVxuICAgKiAgQHBhcmFtIHtMYXllcn0gbGF5ZXIgLSB0aGUgbGF5ZXIgdG8gcmVtb3ZlXG4gICAqL1xuICByZW1vdmVMYXllcihsYXllcikge1xuICAgIHRoaXMudHJhY2tzLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdHJhY2subGF5ZXJzLmluZGV4T2YobGF5ZXIpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkgeyB0cmFjay5yZW1vdmUobGF5ZXIpOyB9XG4gICAgfSk7XG5cbiAgICAvLyBjbGVhbiByZWZlcmVuY2VzIGluIGhlbHBlcnNcbiAgICBmb3IgKGxldCBncm91cElkIGluIHRoaXMuX2dyb3VwZWRMYXllcnMpIHtcbiAgICAgIGNvbnN0IGdyb3VwID0gdGhpcy5fZ3JvdXBlZExheWVyc1tncm91cElkXTtcbiAgICAgIGNvbnN0IGluZGV4ID0gZ3JvdXAuaW5kZXhPZihsYXllcik7XG5cbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHsgZ3JvdXAuc3BsaWNlKGxheWVyLCAxKTsgfVxuXG4gICAgICBpZiAoIWdyb3VwLmxlbmd0aCkge1xuICAgICAgICBkZWxldGUgdGhpcy5fZ3JvdXBlZExheWVyc1tncm91cElkXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogIFJldHVybnMgYSB0cmFjayBmcm9tIGl0J3MgaWRcbiAgICogIEBwYXJhbSB7U3RyaW5nfSB0cmFja0lkXG4gICAqICBAcmV0dXJuIHtUcmFja31cbiAgICovXG4gIGdldFRyYWNrQnlJZCh0cmFja0lkKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrQnlJZFt0cmFja0lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgUmV0dXJucyB0aGUgdHJhY2sgY29udGFpbmluZyBhIGdpdmVuIERPTSBFbGVtZW50LCBpZiBubyBtYXRjaCBmb3VuZCByZXR1cm4gbnVsbFxuICAgKiAgQHBhcmFtIHtET01FbGVtZW50fSAkZWxcbiAgICogIEByZXR1cm4ge1RyYWNrfG51bGx9XG4gICAqL1xuICBnZXRUcmFja0Zyb21ET01FbGVtZW50KCRlbCkge1xuICAgIGxldCAkc3ZnID0gbnVsbDtcbiAgICBsZXQgdHJhY2sgPSBudWxsO1xuICAgIC8vIGZpbmQgdGhlIGNsb3Nlc3QgYC50cmFja2AgZWxlbWVudFxuICAgIGRvIHtcbiAgICAgIGlmICgkZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCd0cmFjaycpKSB7XG4gICAgICAgICRzdmcgPSAkZWw7XG4gICAgICB9XG4gICAgICAkZWwgPSAkZWwucGFyZW50Tm9kZTtcbiAgICB9IHdoaWxlICgkc3ZnID09PSBudWxsKTtcbiAgICAvLyBmaW5kIHRoZSByZWxhdGVkIGBUcmFja2BcbiAgICB0aGlzLnRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKF90cmFjaykge1xuICAgICAgaWYgKF90cmFjay4kc3ZnID09PSAkc3ZnKSB7IHRyYWNrID0gX3RyYWNrOyB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJhY2s7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBsYXllcnMgZnJvbSB0aGVpciBncm91cCBJZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdXBJZFxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGdldExheWVyc0J5R3JvdXAoZ3JvdXBJZCkge1xuICAgIHJldHVybiB0aGlzLl9ncm91cGVkTGF5ZXJzW2dyb3VwSWRdO1xuICB9XG5cbiAgKltTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgIHlpZWxkKiB0aGlzLnRyYWNrc1tTeW1ib2wuaXRlcmF0b3JdKCk7XG4gIH1cbn1cbiJdfQ==