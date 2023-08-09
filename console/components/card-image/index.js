import LazyImage from "../lazy-image";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4096, min: 2048 },
    items: 1
  },
  desktop: {
    breakpoint: { max: 2048, min: 1024 },
    items: 1
  },
  tablet: {
    breakpoint: { max: 1024, min: 768 },
    items: 1
  },
  mobile: {
    breakpoint: { max: 768, min: 0 },
    items: 1
  }
};

export const CardImage = ({carouselRef, images, ...props}) => 
  <Carousel 
    ref={carouselRef}
    showDots={images?.length > 1} 
    dotListClass="custom-dot-list-style"
    responsive={responsive}>
    {!!images && images.map((img, index) => <LazyImage key={`${img.src}-${index}`} src={img.src} {...props} />)}
  </Carousel>