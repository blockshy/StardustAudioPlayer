
export const extractDominantColor = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Resize image to small dimensions for faster processing
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        // Ignore transparent pixels
        if (a < 128) continue;

        // Ignore extremely dark or light pixels to find the "vibrant" color
        // This helps avoid black/white backgrounds skewing the result to gray
        if ((r < 20 && g < 20 && b < 20) || (r > 230 && g > 230 && b > 230)) {
           continue;
        }

        rSum += r;
        gSum += g;
        bSum += b;
        count++;
      }
      
      // Fallback if image is monochrome or all pixels were skipped
      if (count === 0) {
          // Try again without filtering
          resolve('#d4b996'); 
          return;
      }

      const rAvg = Math.floor(rSum / count);
      const gAvg = Math.floor(gSum / count);
      const bAvg = Math.floor(bSum / count);

      // Convert to hex
      const hex = "#" + ((1 << 24) + (rAvg << 16) + (gAvg << 8) + bAvg).toString(16).slice(1);
      resolve(hex);
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
};

export const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
