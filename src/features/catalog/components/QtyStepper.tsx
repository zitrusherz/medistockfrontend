import React from 'react';

export interface QtyStepperProps {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    unit?: string;
}

export const QtyStepper: React.FC<QtyStepperProps> = ({
                                                          value,
                                                          onChange,
                                                          min = 1,
                                                          max = 999,
                                                          disabled = false,
                                                          unit
                                                      }) => {
    const handleDecrement = () => {
        if (!disabled && value > min) onChange(value - 1);
    };

    const handleIncrement = () => {
        if (!disabled && value < max) onChange(value + 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val)) return;
        onChange(Math.min(max, Math.max(min, val)));
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className="w-16 text-center text-[15px] font-semibold text-ink py-2.5 rounded-lg ring-1 ring-grape-200 focus:ring-2 focus:ring-grape-500 outline-none disabled:opacity-50 disabled:bg-gray-100"
            />
            <div className={`flex rounded-lg ring-1 ring-grape-200 overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                    onClick={handleDecrement}
                    disabled={disabled || value <= min}
                    className="px-3 py-2.5 text-grape-600 hover:bg-grape-50 disabled:opacity-50"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
                </button>
                <button
                    onClick={handleIncrement}
                    disabled={disabled || value >= max}
                    className="px-3 py-2.5 text-grape-600 hover:bg-grape-50 border-l border-grape-200 disabled:opacity-50"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                </button>
            </div>
            {unit && <span className="text-[12px] font-bold text-grape-500 ml-1">{unit}</span>}
        </div>
    );
};