import { useState, useEffect } from 'react';

export const useWindowDimensions = (w) => {
  const [size, setSize] = useState({width: undefined, height: undefined});

  useEffect(() => {
    const updateDimensions = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    if(!window) return;
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, [w]);

  return size;
}