import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Match from '../models/Match.js';
import { computeMatchScore } from './ai.service.js';
import { createNotification } from './notification.service.js';

export const runMatchingForItem = async (newItem, itemType) => {
  try {
    let candidates = [];
    
    if (itemType === 'lost') {
      candidates = await FoundItem.find({
        status: 'available',
        'location.city': newItem.location.city
      }).select('+imageEmbeddings');
    } else {
      candidates = await LostItem.find({
        status: 'active',
        'location.city': newItem.location.city
      }).select('+imageEmbeddings');
    }

    const matches = [];

    // Process all candidates in parallel (capped at 10 at once for large sets)
    const chunkSize = 10;
    for (let i = 0; i < candidates.length; i += chunkSize) {
      const chunk = candidates.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (candidate) => {
        const lostItem = itemType === 'lost' ? newItem : candidate;
        const foundItem = itemType === 'found' ? newItem : candidate;
        
        const scoreResult = computeMatchScore(lostItem, foundItem);
        
        if (scoreResult.total >= 50) {
          // Check if match already exists
          const existingMatch = await Match.findOne({
            lostItemId: lostItem._id,
            foundItemId: foundItem._id
          });

          if (!existingMatch) {
            const newMatch = new Match({
              lostItemId: lostItem._id,
              foundItemId: foundItem._id,
              lostUserId: lostItem.userId,
              foundUserId: foundItem.userId,
              score: scoreResult.total,
              breakdown: scoreResult.breakdown
            });
            await newMatch.save();
            matches.push(newMatch);

            // Notify if high score
            if (scoreResult.total >= 70) {
              await createNotification({
                userId: lostItem.userId,
                title: 'High Confidence Match Found!',
                body: `We found a potential match for your lost ${lostItem.title}. Score: ${scoreResult.total}%`,
                type: 'new_match',
                data: { matchId: newMatch._id, itemId: lostItem._id }
              });

              await createNotification({
                userId: foundItem.userId,
                title: 'High Confidence Match Found!',
                body: `A lost item closely matches the ${foundItem.title} you found. Score: ${scoreResult.total}%`,
                type: 'new_match',
                data: { matchId: newMatch._id, itemId: foundItem._id }
              });
              
              newMatch.isNotified = true;
              await newMatch.save();
            }
          }
        }
      }));
    }

    // Return top 10 matches descending
    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.error('Error in runMatchingForItem:', error);
  }
};

export const getMatchesForItem = async (itemId, itemType) => {
  const query = itemType === 'lost' ? { lostItemId: itemId } : { foundItemId: itemId };
  
  return await Match.find(query)
    .populate('lostItem')
    .populate('foundItem')
    .populate('lostUserId', 'name avatar reputationScore')
    .populate('foundUserId', 'name avatar reputationScore')
    .sort({ score: -1 });
};
