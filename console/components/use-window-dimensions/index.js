import { useState, useEffect } from 'react';

export const useWindowDimensions = (w) => {
  const [size, setSize] = useState({width: undefined, height: undefined});
  const [mediaConstrains, setMediaConstrains] = useState({
      video: { aspectRatio: 9/16 }
    });
  const [orientation, setOrientation] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });

      var constraints = {...mediaConstrains};

      // 檢查裝置方向
      var orient = window.orientation || 0;

      // 如果裝置是橫向，則嘗試獲取 4K 解析度
      if (orient === 90 || orient === -90) {
          constraints.video.width = { ideal: 4096 };
          constraints.video.height = { ideal: 2160 };
      } else {  // 如果裝置是縱向，則調整解析度的寬高值
          constraints.video.width = { ideal: 2160 };
          constraints.video.height = { ideal: 4096 };
      }

      setOrientation(orient);
      setMediaConstrains(constraints);
    }

    if(!window) return;
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, [w]);

  return {...size, mediaConstrains, orientation};
}