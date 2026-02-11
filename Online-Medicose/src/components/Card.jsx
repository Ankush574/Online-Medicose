import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8',
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    default: 'shadow-md',
    large: 'shadow-lg',
  };

  const classes = `card-surface ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;