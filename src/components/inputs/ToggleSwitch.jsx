// /src/components/Inputs/ToggleSwitch.jsx
export default function ToggleSwitch({ checked, onToggle, className = 'param-toggle' }) {
  return (
    <div className={`${className} ${checked ? 'on' : 'off'}`} onClick={onToggle}>
      {checked ? 'ON' : 'OFF'}
    </div>
  );
}
