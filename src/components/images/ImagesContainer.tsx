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
    <div className="images-container" id="imagesContainer">
      <div className="images-header">
        <h1>Generated Images</h1>
        <p className="images-subtitle">Your AI-generated image gallery</p>
      </div>

      <div className="images-grid" id="imagesGrid">
        {isLoading ? (
          <div className="loading-images">
            <div className="spinner"></div>
            <p>Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="empty-images">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
              <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <p>No generated images yet. Use an image model to create your first image!</p>
          </div>
        ) : (
          images.map((image) => (
            <div 
              key={image.id} 
              className="image-card"
              onClick={() => setSelectedImage(image)}
            >
              <div className="image-thumbnail">
                <img src={image.url} alt={image.prompt} />
              </div>
              <div className="image-info">
                <p className="image-prompt">{image.prompt}</p>
                <div className="image-meta">
                  <span className="image-model">{image.model}</span>
                  <span className="image-date">{formatDate(image.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="image-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img src={selectedImage.url} alt={selectedImage.prompt} />
            <div className="lightbox-info">
              <p className="lightbox-prompt">{selectedImage.prompt}</p>
              <div className="lightbox-meta">
                <span>Model: {selectedImage.model}</span>
                <span>Created: {formatDate(selectedImage.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
