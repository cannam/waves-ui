/**
 * Created by lucas on 11/01/2017.
 */
import Timeline from './timeline';

export default class NotifyingTimeline extends Timeline {
  constructor(pixelsPerSecond = 100,
              visibleWidth = 1000) {
    super(pixelsPerSecond, visibleWidth);
    this.pixelToTime = this.timeToPixel.invert;
  }

  get zoom(){
    return super.zoom;
  }

  set zoom(value) {
    this.emit('visibleExtentsChanged', {
      start: -this.offset,
      end: -this.offset + this.pixelToTime(this.visibleWidth),
      horizontalScaleFactor: value
    });
    super.zoom = value;
  }

  get offset() {
    return super.offset;
  }

  set offset(value) {
    if (value > 0) value = 0;
    this.emit('visibleExtentsChanged', {
      start: -value,
      end: -value + this.pixelToTime(this.visibleWidth),
      horizontalScaleFactor: this.zoom
    });
    super.offset = value;
  }
}