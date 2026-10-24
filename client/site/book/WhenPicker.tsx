// Fieldset 03: the day strip and the time slots, both plain radio groups.
import { useId } from 'react';
import type { BookingDay } from './booking';

interface WhenPickerProps {
  days: BookingDay[];
  day: string;
  onDay: (iso: string) => void;
  slots: string[];
  time: string;
  onTime: (slot: string) => void;
}

export function WhenPicker({ days, day, onDay, slots, time, onTime }: WhenPickerProps) {
  const id = useId();

  return (
    <fieldset>
      <legend><span>03</span> When</legend>
      <div className="field">
        <span className="label" id={`${id}-day`}>Day</span>
        <div className="days" role="radiogroup" aria-labelledby={`${id}-day`}>
          {days.map((d, i) => (
            <div className="day" key={d.iso}>
              <input
                type="radio" name="day" id={`${id}-d${i}`} value={d.iso} aria-label={d.long}
                checked={d.iso === day} onChange={() => onDay(d.iso)}
              />
              <label htmlFor={`${id}-d${i}`}><small>{d.weekday}</small><b>{d.date}</b><small>{d.month}</small></label>
            </div>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="label" id={`${id}-time`}>Time</span>
        <div className="slots" role="radiogroup" aria-labelledby={`${id}-time`}>
          {slots.map((slot, i) => (
            <div className="slot" key={slot}>
              <input
                type="radio" name="time" id={`${id}-t${i}`} value={slot}
                checked={slot === time} onChange={() => onTime(slot)}
              />
              <label htmlFor={`${id}-t${i}`}>{slot}</label>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
