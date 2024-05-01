import React, { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropUtils"; // You need to implement cropUtils.js


const ImageCropper = ({ imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const cropperRef = useRef(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Pass the cropped image to the parent component
      onCropComplete(croppedImage);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  };

  return (
    <div className="image-cropper">
      <div className="crop-container">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={10 / 3} // You can adjust this aspect ratio as needed
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
          ref={cropperRef}
        />
      </div>

      <div className="controls">
        <button onClick={handleCropImage} className="btn btn-secondary">Done</button>
      </div>
    </div>
  );
};

export default ImageCropper;
