import { useEffect } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { IoClose } from 'react-icons/io5';

const ProductImageLightbox = ({ images, startIndex = 0, isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !images?.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product image gallery"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-dark hover:bg-white"
        aria-label="Close gallery"
      >
        <IoClose size={28} />
      </button>

      <div
        className="w-full max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Splide
          key={startIndex}
          options={{
            start: startIndex,
            type: 'loop',
            perPage: 1,
            gap: '1rem',
            pagination: images.length > 1,
            arrows: images.length > 1,
          }}
        >
          {images.map((image, index) => (
            <SplideSlide key={index}>
              {image.isVideo ? (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${image.videoId}`}
                    title={image.title || image.alt}
                    className="h-full w-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={`${image.url}?v=${new Date().getTime()}`}
                  alt={image.alt}
                  title={image.title}
                  className="mx-auto max-h-[80vh] w-full rounded-md object-contain"
                />
              )}
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </div>
  );
};

export default ProductImageLightbox;
