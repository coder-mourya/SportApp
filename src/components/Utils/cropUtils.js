export const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  // Ensure image is loaded before attempting to draw it
  await new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      resolve();
    };
    img.src = imageSrc;
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg/png/svg", // You can adjust the format here
      1 // You can adjust the image quality here
    );
  });
};
