import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | string;
export type ButtonSize = 'sm' | 'md' | 'lg' | string;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullwidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
                                         variant = 'primary',
                                         size = 'md',
                                         fullwidth = false,
                                         className = '',
                                         children,
                                         ...rest
                                       }) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullwidth ? 'btn--fullwidth' : '',
    className,
  ]
      .filter(Boolean)
      .join(' ');

  return (
      <button {...rest} className={classes}>
        {children}
      </button>
  );
};

export default Button;
