'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utilsScales = require('../utils/scales');

var _utilsScales2 = _interopRequireDefault(_utilsScales);

var _baseState = require('./base-state');

/**
 * `CenteredZoomState` is a timeline state that allows the user to browse the timeline by clicking on a track, and then
 * - moving down to zoom in
 * - moving up to zoom out
 * - moving left to move in time, after
 * - moving right to move in time, before
 */

var _baseState2 = _interopRequireDefault(_baseState);

var CenteredZoomState = (function (_BaseState) {
  _inherits(CenteredZoomState, _BaseState);

  function CenteredZoomState(timeline) {
    _classCallCheck(this, CenteredZoomState);

    _get(Object.getPrototypeOf(CenteredZoomState.prototype), 'constructor', this).call(this, timeline);
    this.currentLayer = null;
    // Set max/min zoom
    // maxZoom: 1px per sample
    // minZoom: 10 000 px per 1 hour
    // with a default to 44.1kHz sample rate
    this.maxZoom = 44100 * 1 / this.timeline.timeContext.pixelsPerSecond;
    this.minZoom = 10000 / 3600 / this.timeline.timeContext.pixelsPerSecond;
  }

  _createClass(CenteredZoomState, [{
    key: 'handleEvent',
    value: function handleEvent(e) {
      switch (e.type) {
        case 'mousedown':
          this.onMouseDown(e);
          break;
        case 'mousemove':
          this.onMouseMove(e);
          break;
        case 'mouseup':
          this.onMouseUp(e);
          break;
      }
    }
  }, {
    key: 'onMouseDown',
    value: function onMouseDown(e) {
      this.mouseDown = true; // is done in surface

      var actualZoom = this.timeline.timeContext.zoom;
      var initialY = e.y;

      this.valueToPixel = _utilsScales2['default'].linear().domain([initialY, 0]).range([actualZoom, -1 * actualZoom]);
    }
  }, {
    key: 'onMouseMove',
    value: function onMouseMove(e) {
      if (!this.mouseDown) {
        return;
      }

      var timeContext = this.timeline.timeContext;
      var lastCenterTime = timeContext.timeToPixel.invert(e.x);

      timeContext.zoom = Math.min(Math.max(this.valueToPixel(e.y), this.minZoom), this.maxZoom);

      var newCenterTime = timeContext.timeToPixel.invert(e.x);
      var delta = newCenterTime - lastCenterTime;

      // Apply new offset to keep it centered to the mouse
      timeContext.offset += delta + timeContext.timeToPixel.invert(e.dx);

      // Other possible experiments with centered-zoom-state
      //
      // Example 1: Prevent timeline.offset to be negative
      // timeContext.offset = Math.min(timeContext.offset, 0);
      //
      // Example 2: Keep in container when zoomed out
      // if (timeContext.stretchRatio < 1) {
      //   const minOffset = timeContext.timeToPixel.invert(0);
      //   const maxOffset = timeContext.timeToPixel.invert(view.width - timeContext.timeToPixel(timeContext.duration));
      //   timeContext.offset = Math.max(timeContext.offset, minOffset);
      //   timeContext.offset = Math.min(timeContext.offset, maxOffset);
      // }

      this.timeline.tracks.update();
    }
  }, {
    key: 'onMouseUp',
    value: function onMouseUp(e) {
      this.mouseDown = false;
    }
  }]);

  return CenteredZoomState;
})(_baseState2['default']);

exports['default'] = CenteredZoomState;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9zdGF0ZXMvY2VudGVyZWQtem9vbS1zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OzJCQUFtQixpQkFBaUI7Ozs7eUJBQ2QsY0FBYzs7Ozs7Ozs7Ozs7O0lBVWYsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFDekIsV0FEUSxpQkFBaUIsQ0FDeEIsUUFBUSxFQUFFOzBCQURILGlCQUFpQjs7QUFFbEMsK0JBRmlCLGlCQUFpQiw2Q0FFNUIsUUFBUSxFQUFFO0FBQ2hCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOzs7OztBQUt6QixRQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDO0FBQ3JFLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUM7R0FDekU7O2VBVmtCLGlCQUFpQjs7V0FZekIscUJBQUMsQ0FBQyxFQUFFO0FBQ2IsY0FBTyxDQUFDLENBQUMsSUFBSTtBQUNYLGFBQUssV0FBVztBQUNkLGNBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsZ0JBQU07QUFBQSxBQUNSLGFBQUssV0FBVztBQUNkLGNBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsZ0JBQU07QUFBQSxBQUNSLGFBQUssU0FBUztBQUNaLGNBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsZ0JBQU07QUFBQSxPQUNUO0tBQ0Y7OztXQUVVLHFCQUFDLENBQUMsRUFBRTtBQUNiLFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUV0QixVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDbEQsVUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFckIsVUFBSSxDQUFDLFlBQVksR0FBRyx5QkFBTyxNQUFNLEVBQUUsQ0FDaEMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ3JCLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQ3pDOzs7V0FFVSxxQkFBQyxDQUFDLEVBQUU7QUFDYixVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUFFLGVBQU87T0FBRTs7QUFFaEMsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7QUFDOUMsVUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUUzRCxpQkFBVyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFMUYsVUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFELFVBQU0sS0FBSyxHQUFHLGFBQWEsR0FBRyxjQUFjLENBQUM7OztBQUc3QyxpQkFBVyxDQUFDLE1BQU0sSUFBSyxLQUFLLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQWVyRSxVQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUMvQjs7O1dBRVEsbUJBQUMsQ0FBQyxFQUFFO0FBQ1gsVUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7S0FDeEI7OztTQXJFa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiJlczYvc3RhdGVzL2NlbnRlcmVkLXpvb20tc3RhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc2NhbGVzIGZyb20gJy4uL3V0aWxzL3NjYWxlcyc7XG5pbXBvcnQgQmFzZVN0YXRlIGZyb20gJy4vYmFzZS1zdGF0ZSc7XG5cblxuLyoqXG4gKiBgQ2VudGVyZWRab29tU3RhdGVgIGlzIGEgdGltZWxpbmUgc3RhdGUgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gYnJvd3NlIHRoZSB0aW1lbGluZSBieSBjbGlja2luZyBvbiBhIHRyYWNrLCBhbmQgdGhlblxuICogLSBtb3ZpbmcgZG93biB0byB6b29tIGluXG4gKiAtIG1vdmluZyB1cCB0byB6b29tIG91dFxuICogLSBtb3ZpbmcgbGVmdCB0byBtb3ZlIGluIHRpbWUsIGFmdGVyXG4gKiAtIG1vdmluZyByaWdodCB0byBtb3ZlIGluIHRpbWUsIGJlZm9yZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDZW50ZXJlZFpvb21TdGF0ZSBleHRlbmRzIEJhc2VTdGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHRpbWVsaW5lKSB7XG4gICAgc3VwZXIodGltZWxpbmUpO1xuICAgIHRoaXMuY3VycmVudExheWVyID0gbnVsbDtcbiAgICAvLyBTZXQgbWF4L21pbiB6b29tXG4gICAgLy8gbWF4Wm9vbTogMXB4IHBlciBzYW1wbGVcbiAgICAvLyBtaW5ab29tOiAxMCAwMDAgcHggcGVyIDEgaG91clxuICAgIC8vIHdpdGggYSBkZWZhdWx0IHRvIDQ0LjFrSHogc2FtcGxlIHJhdGVcbiAgICB0aGlzLm1heFpvb20gPSA0NDEwMCAqIDEgLyB0aGlzLnRpbWVsaW5lLnRpbWVDb250ZXh0LnBpeGVsc1BlclNlY29uZDtcbiAgICB0aGlzLm1pblpvb20gPSAxMDAwMCAvIDM2MDAgLyB0aGlzLnRpbWVsaW5lLnRpbWVDb250ZXh0LnBpeGVsc1BlclNlY29uZDtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50KGUpIHtcbiAgICBzd2l0Y2goZS50eXBlKSB7XG4gICAgICBjYXNlICdtb3VzZWRvd24nOlxuICAgICAgICB0aGlzLm9uTW91c2VEb3duKGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21vdXNlbW92ZSc6XG4gICAgICAgIHRoaXMub25Nb3VzZU1vdmUoZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbW91c2V1cCc6XG4gICAgICAgIHRoaXMub25Nb3VzZVVwKGUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBvbk1vdXNlRG93bihlKSB7XG4gICAgdGhpcy5tb3VzZURvd24gPSB0cnVlOyAvLyBpcyBkb25lIGluIHN1cmZhY2VcblxuICAgIGNvbnN0IGFjdHVhbFpvb20gPSB0aGlzLnRpbWVsaW5lLnRpbWVDb250ZXh0Lnpvb207XG4gICAgY29uc3QgaW5pdGlhbFkgPSBlLnk7XG5cbiAgICB0aGlzLnZhbHVlVG9QaXhlbCA9IHNjYWxlcy5saW5lYXIoKVxuICAgICAgLmRvbWFpbihbaW5pdGlhbFksIDBdKVxuICAgICAgLnJhbmdlKFthY3R1YWxab29tLCAtMSAqIGFjdHVhbFpvb21dKTtcbiAgfVxuXG4gIG9uTW91c2VNb3ZlKGUpIHtcbiAgICBpZiAoIXRoaXMubW91c2VEb3duKSB7IHJldHVybjsgfVxuXG4gICAgY29uc3QgdGltZUNvbnRleHQgPSB0aGlzLnRpbWVsaW5lLnRpbWVDb250ZXh0O1xuICAgIGNvbnN0IGxhc3RDZW50ZXJUaW1lID0gdGltZUNvbnRleHQudGltZVRvUGl4ZWwuaW52ZXJ0KGUueCk7XG5cbiAgICB0aW1lQ29udGV4dC56b29tID0gTWF0aC5taW4oTWF0aC5tYXgodGhpcy52YWx1ZVRvUGl4ZWwoZS55KSwgdGhpcy5taW5ab29tKSwgdGhpcy5tYXhab29tKTtcblxuICAgIGNvbnN0IG5ld0NlbnRlclRpbWUgPSB0aW1lQ29udGV4dC50aW1lVG9QaXhlbC5pbnZlcnQoZS54KTtcbiAgICBjb25zdCBkZWx0YSA9IG5ld0NlbnRlclRpbWUgLSBsYXN0Q2VudGVyVGltZTtcblxuICAgIC8vIEFwcGx5IG5ldyBvZmZzZXQgdG8ga2VlcCBpdCBjZW50ZXJlZCB0byB0aGUgbW91c2VcbiAgICB0aW1lQ29udGV4dC5vZmZzZXQgKz0gKGRlbHRhICsgdGltZUNvbnRleHQudGltZVRvUGl4ZWwuaW52ZXJ0KGUuZHgpKTtcblxuICAgIC8vIE90aGVyIHBvc3NpYmxlIGV4cGVyaW1lbnRzIHdpdGggY2VudGVyZWQtem9vbS1zdGF0ZVxuICAgIC8vXG4gICAgLy8gRXhhbXBsZSAxOiBQcmV2ZW50IHRpbWVsaW5lLm9mZnNldCB0byBiZSBuZWdhdGl2ZVxuICAgIC8vIHRpbWVDb250ZXh0Lm9mZnNldCA9IE1hdGgubWluKHRpbWVDb250ZXh0Lm9mZnNldCwgMCk7XG4gICAgLy9cbiAgICAvLyBFeGFtcGxlIDI6IEtlZXAgaW4gY29udGFpbmVyIHdoZW4gem9vbWVkIG91dFxuICAgIC8vIGlmICh0aW1lQ29udGV4dC5zdHJldGNoUmF0aW8gPCAxKcKge1xuICAgIC8vICAgY29uc3QgbWluT2Zmc2V0ID0gdGltZUNvbnRleHQudGltZVRvUGl4ZWwuaW52ZXJ0KDApO1xuICAgIC8vICAgY29uc3QgbWF4T2Zmc2V0ID0gdGltZUNvbnRleHQudGltZVRvUGl4ZWwuaW52ZXJ0KHZpZXcud2lkdGggLSB0aW1lQ29udGV4dC50aW1lVG9QaXhlbCh0aW1lQ29udGV4dC5kdXJhdGlvbikpO1xuICAgIC8vICAgdGltZUNvbnRleHQub2Zmc2V0ID0gTWF0aC5tYXgodGltZUNvbnRleHQub2Zmc2V0LCBtaW5PZmZzZXQpO1xuICAgIC8vICAgdGltZUNvbnRleHQub2Zmc2V0ID0gTWF0aC5taW4odGltZUNvbnRleHQub2Zmc2V0LCBtYXhPZmZzZXQpO1xuICAgIC8vIH1cblxuICAgIHRoaXMudGltZWxpbmUudHJhY2tzLnVwZGF0ZSgpO1xuICB9XG5cbiAgb25Nb3VzZVVwKGUpIHtcbiAgICB0aGlzLm1vdXNlRG93biA9IGZhbHNlO1xuICB9XG59XG4iXX0=