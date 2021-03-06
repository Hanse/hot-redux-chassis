import styles from './Button.css';
import React, { HTMLProps } from 'react';
import cx from 'classnames';

type Props = {
  className?: string;
  block?: boolean;
  link?: boolean;
  loading?: boolean;
  children?: any;
} & HTMLProps<HTMLButtonElement>;

function Button({
  className,
  link = false,
  loading = false,
  block = false,
  children,
  ...props
}: Props) {
  return (
    <button
      type={'button' as any}
      className={cx(
        typeof className === 'string' ? className : styles.button,
        block && styles.block,
        link && styles.link
      )}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

export default Button;
