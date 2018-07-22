import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import { formatMilliseconds } from 'common/format';

const debug = false;

const MS_BUFFER = 8000;

class Channeling extends CoreChanneling {

  lastRapidFireCast = 0;
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.BARRAGE_TALENT.id) {
      this.beginChannel(event);
      return;
    }
    if (event.ability.guid === SPELLS.RAPID_FIRE.id) {
      if (event.timestamp > this.lastRapidFireCast + MS_BUFFER) {
        this.beginChannel(event);
        this.lastRapidFireCast = event.timestamp;
        return;
      }
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.BARRAGE_TALENT.id) || this.isChannelingSpell(SPELLS.RAPID_FIRE.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Channeling', 'Marking', this._currentChannel.ability.name, 'as ended since we started casting something else');
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.RAPID_FIRE_BUFF.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.RAPID_FIRE.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
}

export default Channeling;
