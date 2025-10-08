// /src/components/Inputs/NumberSliderInput.jsx
import { useEffect, useRef } from 'react';

export default function NumberSliderInput({
  min, max, step = 1, defaultValue, className = 'param-input',
  onChange, onClick, onKeyDown,
}) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const v = Number(defaultValue ?? min);
    if (wrapperRef.current) {
      wrapperRef.current.setAttribute('data-value', v);
      const pct = ((v - min) / (max - min)) * 100;
      wrapperRef.current.style.setProperty('--fill-percentage', `${pct}%`);
    }
  }, [defaultValue, min, max]);

  const handleMouseDown = (e) => {
    const input = inputRef.current;
    const startX = e.clientX;
    const startValue = Number(input.value);
    const sensitivity = (max - min) / 200;

    const handleMove = (ev) => {
      let newVal = startValue + (ev.clientX - startX) * sensitivity;
      newVal = Math.max(min, Math.min(max, newVal));
      if (step < 1) {
        newVal = Math.round(newVal / step) * step;
        newVal = Number(newVal.toFixed(2));
      } else newVal = Math.round(newVal);
      input.value = newVal;
      onChange?.({ target: input });
      const pct = ((newVal - min) / (max - min)) * 100;
      wrapperRef.current?.style.setProperty('--fill-percentage', `${pct}%`);
      wrapperRef.current?.setAttribute('data-value', newVal);
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    e.preventDefault();
  };

  const clampOnChange = (e) => {
    let v = Number(e.target.value);
    if (!Number.isNaN(v)) {
      v = Math.max(min, Math.min(max, v));
      e.target.value = v;
      const pct = ((v - min) / (max - min)) * 100;
      wrapperRef.current?.style.setProperty('--fill-percentage', `${pct}%`);
      wrapperRef.current?.setAttribute('data-value', v);
    }
    onChange?.(e);
  };

  return (
    <div ref={wrapperRef} className="param-input-wrapper" data-min={min} data-max={max} data-value={defaultValue ?? min}>
      <input
        ref={inputRef}
        type="number"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue ?? min}
        className={className}
        onMouseDown={(e) => { if (e.detail !== 2) handleMouseDown(e); }}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onChange={clampOnChange}
      />
    </div>
  );
}
