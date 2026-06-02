import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUploader = ({ images, setImages, maxFiles = 3 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }
    
    const newImages = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    setImages(prev => [...prev, ...newImages]);
  }, [images, maxFiles, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles
  });

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-300 bg-white/50 hover:bg-slate-100/50'
        }`}
      >
        <input {...getInputProps()} />
        <svg className="w-12 h-12 mx-auto text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {isDragActive ? (
          <p className="text-indigo-400">Drop the images here ...</p>
        ) : (
          <p className="text-slate-600">
            Drag & drop images here, or <span className="text-indigo-400">click to select files</span>
          </p>
        )}
        <p className="text-xs text-slate-500 mt-2">Max {maxFiles} images (JPEG, PNG, WEBP)</p>
      </div>

      {images.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {images.map((file, index) => (
            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group">
              <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-slate-900 hover:text-rose-500 p-1 bg-black/50 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
