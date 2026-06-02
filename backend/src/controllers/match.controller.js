import Match from '../models/Match.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import { runMatchingForItem } from '../services/match.service.js';

export const getMatchesForLostItem = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) return res.status(404).json({ error: 'Lost item not found' });
    if (lostItem.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const matches = await Match.find({ lostItemId: req.params.id })
      .populate({ path: 'foundItemId', select: '-imageEmbeddings' })
      .populate('foundUserId', 'name avatar reputationScore')
      .sort({ score: -1 });

    res.status(200).json({ matches });
  } catch (error) {
    next(error);
  }
};

export const getMatchesForFoundItem = async (req, res, next) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);
    if (!foundItem) return res.status(404).json({ error: 'Found item not found' });
    if (foundItem.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const matches = await Match.find({ foundItemId: req.params.id })
      .populate({ path: 'lostItemId', select: '-imageEmbeddings' })
      .populate('lostUserId', 'name avatar reputationScore')
      .sort({ score: -1 });

    res.status(200).json({ matches });
  } catch (error) {
    next(error);
  }
};

export const getMyMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      $or: [{ lostUserId: req.user._id }, { foundUserId: req.user._id }]
    })
    .populate({ path: 'lostItemId', select: '-imageEmbeddings' })
    .populate({ path: 'foundItemId', select: '-imageEmbeddings' })
    .populate('lostUserId', 'name avatar')
    .populate('foundUserId', 'name avatar')
    .sort({ createdAt: -1 });

    const grouped = {
      asLostOwner: matches.filter(m => m.lostUserId._id.toString() === req.user._id.toString()),
      asFoundOwner: matches.filter(m => m.foundUserId._id.toString() === req.user._id.toString())
    };

    res.status(200).json(grouped);
  } catch (error) {
    next(error);
  }
};

export const triggerManualMatch = async (req, res, next) => {
  try {
    const { itemId, itemType } = req.body;
    
    let item;
    if (itemType === 'lost') {
      item = await LostItem.findById(itemId).select('+imageEmbeddings');
    } else {
      item = await FoundItem.findById(itemId).select('+imageEmbeddings');
    }

    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newMatches = await runMatchingForItem(item, itemType);

    res.status(200).json({ 
      message: 'Manual match completed',
      matchesFound: newMatches ? newMatches.length : 0 
    });
  } catch (error) {
    next(error);
  }
};
