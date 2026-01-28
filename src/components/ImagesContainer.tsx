import { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { useImageStore } from '../stores/imageStore';
import type { GeneratedImage } from '../types';

export function ImagesContainer() {
  const { images, isLoadingImages, loadImages, deleteImage } = useImageStore();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    loadImages();
  }, []);


  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteImage(id);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
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
        {isLoadingImages ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted">
            <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted text-center px-4">
            <ImageIcon size={48} className="mb-4 opacity-30" />
             <h4 className="text-lg font-bold text-text-primary mb-2">
               No generated images yet
              </h4>
            <p className="text-sm max-w-md">Use an image model to create your first image!</p>
          </div>
        ) : (
          images.map((image) => (
            <div 
              key={image.id} 
              className="bg-bg-secondary rounded-lg overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group border border-transparent hover:border-accent relative"
              onClick={() => setSelectedImage(image)}
            >
              <button 
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all z-10 border-none cursor-pointer"
                onClick={(e) => handleDelete(e, image.id)}
                title="Delete image"
              >
                <Trash2 size={16} />
              </button>
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
              <X size={20} />
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
