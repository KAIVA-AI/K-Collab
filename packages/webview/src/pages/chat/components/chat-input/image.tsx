import React from 'react';

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  [key: string]: any; // for any additional props like 'onClick' or 'className'
}

const CustomImage: React.FC<CustomImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  style, 
  ...props 
}) => (
  <img 
    src={src} 
    alt={alt} 
    width={width} 
    height={height} 
    loading="lazy" 
    style={{ objectFit: "cover", ...style }} 
    {...props} 
  />
);

export default CustomImage;