import { useState, useEffect } from 'react';

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  model: string;
  createdAt: number;
}

export function ImagesContainer() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with Tauri command
      // const images = await commands.getGeneratedImages();
      // setImages(images);
      setImages([]);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-bg-primary" id="imagesContainer">
      <div className="mb-12 text-center max-w-150 mx-auto">
        <h1 className="text-[32px] font-semibold mb-2 text-brand">Generated Images</h1>
        <p className="text-text-secondary text-base leading-6">Your AI-generated image gallery</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8" id="imagesGrid">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted">
            <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted text-center px-4">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" className="mb-4 opacity-30">
              <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
             <h4 className="text-lg font-bold text-text-primary mb-2">
               No generated images yet. 
              </h4>
            <p className="text-sm max-w-md">Use an image model to create your first image!</p>
          </div>
        ) : (
          images.map((image) => (
            <div 
              key={image.id} 
              className="bg-bg-secondary rounded-lg overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group border border-transparent hover:border-accent"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square bg-bg-tertiary overflow-hidden">
                <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <p className="text-sm text-text-primary mb-2 line-clamp-2 leading-snug">{image.prompt}</p>
                <div className="flex justify-between items-center text-xs text-text-muted">
                  <span className="font-medium bg-bg-tertiary px-1.5 py-0.5 rounded">{image.model}</span>
                  <span>{formatDate(image.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-2000 flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="bg-bg-secondary rounded-xl overflow-hidden max-w-4xl max-h-full flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10 border-none cursor-pointer"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <div className="flex-1 bg-black overflow-hidden flex items-center justify-center min-h-75">
              <img src={selectedImage.url} alt={selectedImage.prompt} className="max-w-full max-h-[70vh] object-contain" />
            </div>
            <div className="p-6 bg-bg-secondary border-t border-border">
              <p className="text-base text-text-primary mb-3 leading-relaxed">{selectedImage.prompt}</p>
              <div className="flex gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="opacity-70">Model:</span>
                  <span className="font-medium text-text-primary px-2 py-0.5 bg-bg-tertiary rounded">{selectedImage.model}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="opacity-70">Created:</span>
                  <span className="text-text-primary">{formatDate(selectedImage.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
