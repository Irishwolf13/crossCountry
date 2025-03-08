export const resizeAndCompressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!file.type.match(/image.*/)) {
        reject(new Error('File is not an image.'));
        return;
      }
  
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = function (e) {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
  
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Maximum width
        const MAX_HEIGHT = 1200; // Maximum height
        let width = img.width;
        let height = img.height;
  
        // Maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
  
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas conversion failed.'));
              }
            },
            file.type,
            1.0 // Compression level (adjust between 0 to 1 for quality)
          );
        } else {
          reject(new Error('Failed to get canvas context.'));
        }
      };
  
      reader.readAsDataURL(file);
    });
  };