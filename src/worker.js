import { removeBg } from './bgRemoval.js';

self.onmessage = ({ data: { buf, width, height, tol, reqId } }) => {
  try {
    const imageData = new ImageData(new Uint8ClampedArray(buf), width, height);
    const bgType = removeBg(imageData, width, height, tol);
    self.postMessage({ buf: imageData.data.buffer, bgType, reqId }, [imageData.data.buffer]);
  } catch (err) {
    self.postMessage({ error: err.message, reqId });
  }
};
