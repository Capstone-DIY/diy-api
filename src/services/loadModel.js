const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

async function loadModel() {
  try {
    const modelPath = process.env.MODEL_URL; // Lokasi model di Google Cloud Storage
    const model = await tf.loadGraphModel(modelPath);
    console.log("Model berhasil dimuat");
    return model;
  } catch (err) {
    console.error("Gagal memuat model:", err);
    throw new Error("Gagal memuat model");
  }
}

module.exports = loadModel;