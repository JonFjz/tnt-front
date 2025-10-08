// /src/components/Inputs/RangeNumberInput.jsx
import { useRef } from 'react';

export default function RangeNumberInput({
  min, max, leftDefault, rightDefault, onLeftChange, onRightChange,
}) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const handle = (e, isLeft) => {
    const input = e.target;
    let v = Number(input.value);
    if (!Number.isNaN(v)) v = Math.max(min, Math.min(max, v));
    input.value = v;

    const L = Number(leftRef.current.value);
    const R = Number(rightRef.current.value);
    if (isLeft && L > R) rightRef.current.value = L;
    if (!isLeft && R < L) leftRef.current.value = R;

    isLeft ? onLeftChange?.(Number(leftRef.current.value))
           : onRightChange?.(Number(rightRef.current.value));
  };

  return (
    <div className="range-inputs">
      <input
        ref={leftRef}
        type="number"
        className="filter-input range-input"
        defaultValue={leftDefault}
        min={min}
        max={max}
        onChange={(e) => handle(e, true)}
      />
      <span className="range-separator">—</span>
      <input
        ref={rightRef}
        type="number"
        className="filter-input range-input"
        defaultValue={rightDefault}
        min={min}
        max={max}
        onChange={(e) => handle(e, false)}
      />
    </div>
  );
}
