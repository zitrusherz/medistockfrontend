

import { type ReactNode } from 'react';
import { Radio, RadioGroup } from '@/components/ui';

interface RadioFilterOption<T extends string> {
    value: T;
    label: ReactNode;
}

interface RadioFilterProps<T extends string> {
    /** name único del grupo (un grupo de radios por filtro). */
    name: string;
    value: T;
    onChange: (value: T) => void;
    options: RadioFilterOption<T>[];
}

export function RadioFilter<T extends string>({ name, value, onChange, options }: RadioFilterProps<T>) {
    return (
        <RadioGroup>
            {options.map((o) => (
                <Radio
                    key={o.value}
                    name={name}
                    value={o.value}
                    checked={value === o.value}
                    onChange={() => onChange(o.value)}
                    label={o.label}
                />
            ))}
        </RadioGroup>
    );
}

export type { RadioFilterProps, RadioFilterOption };
