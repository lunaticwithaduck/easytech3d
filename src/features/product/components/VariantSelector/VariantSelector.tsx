'use client';

import { type CSSProperties, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Text } from '@/design-system/primitives/Text/Text';
import type { ProductOption } from '@/server/catalog/types';
import { isColorOption, swatchColorFor } from '../../utils/swatchColors.utils';
import {
  optionGroupClass,
  optionLabelClass,
  optionsWrapperClass,
  pillRowClass,
  pillVariants,
  swatchItemVariants,
  swatchRowClass,
} from './VariantSelector.styles';

export type VariantSelectorProps = {
  options: ProductOption[];
};

// 1:1 port of the `product_options_block` in `sections/product-template.liquid` (+ swatch.liquid).
// Color options ("Цвят") render as 18px swatch circles with the pink selection ring; other options
// ("Тегло") render as pill buttons. Selection is tracked in local state (defaults to the first value
// of each option), standing in for the Liquid single-option selectors until the cart backend wires
// variant resolution.
export function VariantSelector({ options }: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((option) => [option.name, option.values[0] ?? ''])),
  );

  if (options.length === 0) return null;

  return (
    <div className={optionsWrapperClass}>
      {options.map((option) => {
        const isColor = isColorOption(option.name);
        return (
          <div key={option.name} className={optionGroupClass}>
            <Text as="span" className={optionLabelClass}>
              {`${option.name}:`}
            </Text>

            {isColor ? (
              <div className={swatchRowClass}>
                {option.values.map((value) => {
                  const isSelected = selected[option.name] === value;
                  return (
                    <Button
                      key={value}
                      unstyled
                      className={swatchItemVariants({ active: isSelected })}
                      title={value}
                      aria-pressed={isSelected}
                      // Per-record dynamic swatch fill — sanctioned via CSS custom property (R1).
                      style={{ '--swatch-color': swatchColorFor(value) } as CSSProperties}
                      onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))}
                    >
                      <Text as="span" className="sr-only">
                        {value}
                      </Text>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className={pillRowClass}>
                {option.values.map((value) => {
                  const isSelected = selected[option.name] === value;
                  return (
                    <Button
                      key={value}
                      unstyled
                      className={pillVariants({ selected: isSelected })}
                      aria-pressed={isSelected}
                      onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))}
                    >
                      <Text as="span" size="sm" color="current" weight="bold">
                        {value}
                      </Text>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
