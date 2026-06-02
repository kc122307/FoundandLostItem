import fs from 'fs';
import sharp from 'sharp';
import axios from 'axios';
import { log } from '../config/logger.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getImageEmbedding = async (imagePath, retries = 3) => {
  try {
    const hfModel = process.env.HF_MODEL || 'openai/clip-vit-base-patch32';
    const HF_API_URL = `https://api-inference.huggingface.co/models/${hfModel}`;

    const imageBuffer = fs.readFileSync(imagePath);
    
    // Resize to 224x224 (CLIP standard input size) and convert to base64
    const resizedBuffer = await sharp(imageBuffer)
      .resize(224, 224, { fit: 'cover' })
      .toFormat('jpeg')
      .toBuffer();
      
    const base64Image = resizedBuffer.toString('base64');

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          HF_API_URL,
          { inputs: { image: base64Image } },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HF_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // HF returns an array of numbers (512 dimensions)
        return response.data;
      } catch (error) {
        if (attempt === retries) throw error;
        // Wait 1 second before retry
        await delay(1000);
      }
    }
  } catch (error) {
    log('error', 'Hugging Face API Error', { error: error.message, imagePath });
    return null;
  }
};

export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  // Convert standard -1 to 1 cosine similarity to a 0 to 1 scale, then percentage
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return similarity * 100;
};

export const haversineDistance = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371; // Earth radius in km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const computeMatchScore = (lostItem, foundItem) => {
  let imageScore = 0;
  
  // 1. Image Score (Average of best matches for each lost image)
  if (lostItem.imageEmbeddings && lostItem.imageEmbeddings.length > 0 && 
      foundItem.imageEmbeddings && foundItem.imageEmbeddings.length > 0) {
    
    let totalBestMatches = 0;
    
    for (const lostEmb of lostItem.imageEmbeddings) {
      let bestMatch = 0;
      for (const foundEmb of foundItem.imageEmbeddings) {
        const sim = cosineSimilarity(lostEmb, foundEmb);
        if (sim > bestMatch) bestMatch = sim;
      }
      totalBestMatches += bestMatch;
    }
    
    imageScore = totalBestMatches / lostItem.imageEmbeddings.length;
  }

  // 2. Category Score
  const categoryScore = lostItem.category === foundItem.category ? 30 : 0;

  // 3. Color Score
  let colorScore = 10; // Neutral default
  if (lostItem.color && foundItem.color) {
    colorScore = lostItem.color.trim().toLowerCase() === foundItem.color.trim().toLowerCase() ? 20 : 0;
  }

  // 4. Location Score
  let locationScore = 0;
  if (lostItem.location?.coordinates && foundItem.location?.coordinates) {
    const dist = haversineDistance(lostItem.location.coordinates, foundItem.location.coordinates);
    if (dist < 1) locationScore = 20;
    else if (dist < 5) locationScore = 15;
    else if (dist < 10) locationScore = 10;
    else if (dist < 20) locationScore = 5;
  }

  // 5. Total Score calculation
  // We cap imageScore at 100 before applying its 0.5 weight.
  const weightedImageScore = Math.min(imageScore, 100) * 0.5;
  const totalScore = weightedImageScore + (categoryScore * 0.3) + (colorScore * 0.1) + (locationScore * 0.1);

  return {
    total: Math.round(totalScore),
    breakdown: {
      imageScore: Math.round(imageScore),
      categoryScore,
      colorScore,
      locationScore
    }
  };
};
