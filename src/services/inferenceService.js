const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

async function getEmotion(model, story) {
  try {
    // Preprocessing story
    const input = processStory(story); // Misalnya, proses story menjadi input yang sesuai dengan model

    // Predict emotion
    const prediction = model.predict(tf.tensor(input));
    const emotion = prediction.dataSync()[0]; // Ambil hasil prediksi emosi

    return emotion;
  } catch (err) {
    console.error("Error in emotion inference:", err);
    throw new Error("Error processing emotion");
  }
}

function processStory(story) {
  // Lakukan pemrosesan data sesuai dengan model, misalnya tokenisasi atau vectorization
  return [story.length]; // Misalnya model hanya membutuhkan panjang cerita (dummy example)
}

module.exports = { getEmotion };