'use client';

import { useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Text } from '@/design-system/primitives/Text/Text';
import type { ProductOption } from '@/server/catalog/types';
import {
  optionButtonVariants,
  optionGroupClass,
  optionValuesClass,
  selectorRootClass,
} from './VariantSelector.styles';

export type VariantSelectorProps = {
  options: ProductOption[];
};

// Renders each product option ("Цвят", "Тегло", …) as a labelled group of value pills. Selection
// is tracked in local state (defaults to the first value of each option), standing in for the
// Liquid single-option selectors until the cart backend wires variant resolution.
export function VariantSelector({ options }: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((option) => [option.name, option.values[0] ?? ''])),
  );

  if (options.length === 0) return null;

  return (
    <div className={selectorRootClass}>
      {options.map((option) => (
        <div key={option.name} className={optionGroupClass}>
          <Text as="span" size="sm" weight="semibold" color="text">
            {option.name}
          </Text>
          <div className={optionValuesClass}>
            {option.values.map((value) => {
              const isSelected = selected[option.name] === value;
              return (
                <Button
                  key={value}
                  unstyled
                  className={optionButtonVariants({ selected: isSelected })}
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [option.name]: value }))
                  }
                >
                  <Text as="span" size="sm" weight="medium" color="current">
                    {value}
                  </Text>
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
