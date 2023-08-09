import React, { useState, useRef, useEffect } from 'react';
import { Collapse } from '@nextui-org/react';

const addImageLoadHandler = (child, handleImageLoad) => {
  if (child.type === 'img') {
    return React.cloneElement(child, {
      onLoad: handleImageLoad,
    });
  }

  if (child.props && child.props.children) {
    return React.cloneElement(child, {
      children: React.Children.map(child.props.children, (nestedChild) =>
        addImageLoadHandler(nestedChild, handleImageLoad)
      ),
    });
  }

  return child;
};

export const CustomCollapse = ({ children, ...props }) => {
  const [active, setActive] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const collapseRef = useRef();

  useEffect(() => {
    if (imageLoaded) {
      setActive(false);
      setTimeout(() => {
        setActive(true);
      }, 50);
    }
  }, [imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const updatedChildren = React.Children.map(children, (child) =>
    addImageLoadHandler(child, handleImageLoad)
  );

  return (
    <Collapse
      ref={collapseRef}
      active={active}
      {...props}
    >
      {updatedChildren}
    </Collapse>
  );
};