/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { ComponentProps, FC, useMemo, useState } from 'react';

import BigNumber from 'bignumber.js';
import { useIntl } from 'react-intl';

import Input from '../Input';
import RadioButton from '../RadioButton';

type NumberInputProps = ComponentProps<typeof Input> & {
  decimal?: number;
  onChange?: (text: string) => void;
  onChangeText?: (text: string) => void;
  enableMaxButton?: boolean;
  isMax?: boolean;
  onMaxChange?: (isMax: boolean) => void;
  maxText?: string;
};

export const NumberInput: FC<NumberInputProps> = ({
  decimal,
  onChange,
  enableMaxButton,
  isMax,
  onMaxChange,
  maxText,
  onBlur,
  onChangeText,
  value,
  ...props
}) => {
  const intl = useIntl();
  // eslint-disable-next-line no-param-reassign
  maxText = maxText || '$i18n$_最大金额';
  const [v, setV] = useState('');

  const maxButton = useMemo(
    () =>
      enableMaxButton ? (
        <RadioButton
          size="sm"
          value="true"
          isChecked={isMax}
          onCheckedChange={onMaxChange}
          title={intl.formatMessage({ id: 'action__max' })}
        />
      ) : undefined,
    [enableMaxButton, intl, isMax, onMaxChange],
  );

  const handleChange = (text: string) => {
    let result = text;

    if (text) {
      result = text.replace(/^\D*(\d*(?:\.\d*)?).*$/g, '$1');

      // limit max decimal
      if (decimal && decimal > 0) {
        const position = text.indexOf('.');
        if (position !== -1 && text.length - 1 - position > decimal) {
          result = text.substring(0, position + decimal + 1);
        }
      }
    }
    setV(result);
    if (onChange) {
      onChange(result);
    }
    if (onChangeText) {
      onChangeText(result);
    }
  };

  const handleBlur = (e: any) => {
    const text = v;

    if (text) {
      if (text.startsWith('.') || text.endsWith('.')) {
        const b = new BigNumber(text);

        if (onChange) {
          onChange(b.toString());
        }
        setV(b.toString());
      }
    }

    if (onBlur) {
      onBlur(e);
    }
  };
  let valueDisplay = value;
  if (enableMaxButton && isMax) {
    valueDisplay = maxText;
  }
  return (
    <Input
      w="full"
      keyboardType="numeric"
      isReadOnly={enableMaxButton && isMax}
      rightSecondaryText={maxButton}
      {...props}
      value={valueDisplay}
      onChangeText={handleChange}
      onBlur={handleBlur}
    />
  );
};