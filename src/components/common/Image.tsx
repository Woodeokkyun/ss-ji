import NextImage, { ImageLoaderProps, ImageProps } from 'next/image';

export function cdnLoader({ src, width }: ImageLoaderProps) {
  return `${src}`;
}

const Image = (props: ImageProps) => {
  return <NextImage {...props} loader={cdnLoader} />;
};

export default Image;
