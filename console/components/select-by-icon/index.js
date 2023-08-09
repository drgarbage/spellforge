import { Grid } from '@nextui-org/react';
import React from 'react';

const Option = ({ selected = false, icon, value, onClick, ...rest }) => 
  <Grid xs={3} {...rest} style={{...rest.style, opacity: selected ? 1 : 0.6 }} onClick={() => onClick(value)}>
    {icon}
  </Grid>;

const SelectByIcon = ({
  children,
  value,
  onChange,
  ...rest
}) => {
  const handleClick = (value) => {
    onChange({ value });
  };

  const options = React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      onClick: handleClick,
    });
  });

  return <Grid.Container {...rest}>{options}</Grid.Container>;
};

SelectByIcon.Option = Option;

export { SelectByIcon };
