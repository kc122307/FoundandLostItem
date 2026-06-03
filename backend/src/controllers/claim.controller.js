import Claim from '../models/Claim.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import { createNotification } from '../services/notification.service.js';
import { scoreOwnerAnswers } from '../services/verification.service.js';

const addPoints = async (userId, type) => {
  const points = type === 'CLAIM_APPROVED' ? 10 : type === 'ITEM_RETURNED' ? 15 : 0;
  if (points > 0) {
    await User.findByIdAndUpdate(userId, { $inc: { reputationScore: points } }, { new: true });
  }
};

export const submitClaim = async (req, res, next) => {
  try {
    const { foundItemId, ownerAnswers } = req.body;

    const foundItem = await FoundItem.findById(foundItemId).select('+verificationQuestions.answer');
    if (!foundItem) return res.status(404).json({ error: 'Found item not found' });
    
    if (foundItem.status !== 'available') {
      return res.status(400).json({ error: 'Item is no longer available' });
    }
    if (foundItem.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot claim your own reported item' });
    }

    const existingClaim = await Claim.findOne({ 
      itemId: foundItemId, 
      claimantId: req.user._id,
      status: 'approved'
    });
    if (existingClaim) {
      return res.status(409).json({ error: 'You already claimed this item' });
    }

    // Try to find if user has a matching lost item
    const matchedLostItem = await LostItem.findOne({ 
      userId: req.user._id, 
      status: 'active',
      category: foundItem.category 
    });

    const result = scoreOwnerAnswers(foundItem, ownerAnswers);

    const claim = new Claim({
      claimantId: req.user._id,
      itemId: foundItemId,
      itemType: 'found',
      lostItemId: matchedLostItem ? matchedLostItem._id : undefined,
      score: result.score,
      approved: result.approved,
      canRetry: result.canRetry,
      attemptNumber: 1,
      ownerAnswers,
      status: result.approved ? 'approved' : 'rejected'
    });

    await claim.save();

    let chatId = null;

    if (result.approved) {
      // Create or find Chat
      let chat = await Chat.findOne({ participants: { $all: [req.user._id, foundItem.userId] } });
      if (!chat) {
        chat = new Chat({
          participants: [req.user._id, foundItem.userId],
          foundItemId,
          lostItemId: matchedLostItem ? matchedLostItem._id : undefined
        });
        await chat.save();
      } else if (chat.hiddenBy && chat.hiddenBy.length > 0) {
        chat.hiddenBy = [];
        await chat.save();
      }
      chatId = chat._id;

      foundItem.status = 'claimed';
      await foundItem.save();

      if (matchedLostItem) {
        matchedLostItem.status = 'matched';
        await matchedLostItem.save();
      }

      await addPoints(req.user._id, 'CLAIM_APPROVED');
      await addPoints(foundItem.userId, 'ITEM_RETURNED');

      await createNotification({
        userId: foundItem.userId,
        title: 'Item Claimed!',
        body: 'Someone correctly identified your found item. Chat to arrange handover.',
        type: 'claim_approved',
        data: { chatId }
      });

      await createNotification({
        userId: req.user._id,
        title: 'Claim Approved!',
        body: 'You correctly identified the item. Chat with the finder now.',
        type: 'claim_approved',
        data: { chatId }
      });
    } else {
      await createNotification({
        userId: req.user._id,
        title: 'Claim Rejected',
        body: result.canRetry ? 'Your answers were close. You have one more attempt.' : 'Your answers did not match. This item may not be yours.',
        type: 'claim_rejected',
        data: { foundItemId }
      });
    }

    res.status(201).json({
      approved: result.approved,
      score: result.score,
      canRetry: result.canRetry && claim.attemptNumber < 2,
      chatId,
      feedback: result.feedback,
      message: result.approved ? 'Claim approved! You can now chat with the finder.' : (result.canRetry ? 'Some answers were incorrect. Try once more.' : 'Claim rejected. The answers did not match.')
    });

  } catch (error) {
    next(error);
  }
};

export const resubmitClaim = async (req, res, next) => {
  try {
    const { originalClaimId, ownerAnswers } = req.body;
    
    const prevClaim = await Claim.findById(originalClaimId);
    if (!prevClaim) return res.status(404).json({ error: 'Original claim not found' });
    
    if (prevClaim.claimantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (prevClaim.attemptNumber >= 2 || !prevClaim.canRetry || prevClaim.status !== 'rejected') {
      return res.status(400).json({ error: 'Cannot retry this claim' });
    }

    const foundItem = await FoundItem.findById(prevClaim.itemId).select('+verificationQuestions.answer');
    if (!foundItem || foundItem.status !== 'available') {
      return res.status(400).json({ error: 'Item is no longer available' });
    }

    const result = scoreOwnerAnswers(foundItem, ownerAnswers);

    const newClaim = new Claim({
      claimantId: req.user._id,
      itemId: foundItem._id,
      itemType: 'found',
      lostItemId: prevClaim.lostItemId,
      score: result.score,
      approved: result.approved,
      canRetry: false, // no 3rd attempt
      attemptNumber: 2,
      previousClaimId: prevClaim._id,
      ownerAnswers,
      status: result.approved ? 'approved' : 'rejected'
    });

    await newClaim.save();

    let chatId = null;

    if (result.approved) {
      let chat = await Chat.findOne({ participants: { $all: [req.user._id, foundItem.userId] } });
      if (!chat) {
        chat = new Chat({
          participants: [req.user._id, foundItem.userId],
          foundItemId: foundItem._id,
          lostItemId: prevClaim.lostItemId
        });
        await chat.save();
      } else if (chat.hiddenBy && chat.hiddenBy.length > 0) {
        chat.hiddenBy = [];
        await chat.save();
      }
      chatId = chat._id;

      foundItem.status = 'claimed';
      await foundItem.save();

      if (prevClaim.lostItemId) {
        const lostItem = await LostItem.findById(prevClaim.lostItemId);
        if (lostItem) {
          lostItem.status = 'matched';
          await lostItem.save();
        }
      }

      await addPoints(req.user._id, 'CLAIM_APPROVED');
      await addPoints(foundItem.userId, 'ITEM_RETURNED');

      await createNotification({
        userId: foundItem.userId,
        title: 'Item Claimed!',
        body: 'Someone correctly identified your found item. Chat to arrange handover.',
        type: 'claim_approved',
        data: { chatId }
      });

      await createNotification({
        userId: req.user._id,
        title: 'Claim Approved!',
        body: 'You correctly identified the item. Chat with the finder now.',
        type: 'claim_approved',
        data: { chatId }
      });
    } else {
      await createNotification({
        userId: req.user._id,
        title: 'Claim Rejected',
        body: 'Your answers did not match. This item may not be yours.',
        type: 'claim_rejected',
        data: { foundItemId: foundItem._id }
      });
    }

    res.status(201).json({
      approved: result.approved,
      score: result.score,
      canRetry: false,
      chatId,
      feedback: result.feedback,
      message: result.approved ? 'Claim approved! You can now chat with the finder.' : 'Claim rejected. The answers did not match.'
    });

  } catch (error) {
    next(error);
  }
};

export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemId', 'title images category location dateFound')
      .sort({ createdAt: -1 });

    res.status(200).json({ claims });
  } catch (error) {
    next(error);
  }
};

export const getClaimsForMyItem = async (req, res, next) => {
  try {
    const myFoundItems = await FoundItem.find({ userId: req.user._id }).select('_id');
    const itemIds = myFoundItems.map(item => item._id);

    const claims = await Claim.find({ itemId: { $in: itemIds } })
      .populate('claimantId', 'name avatar reputationScore')
      .populate('itemId', 'title images category')
      .sort({ createdAt: -1 });

    res.status(200).json({ claims });
  } catch (error) {
    next(error);
  }
};

export const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimantId', 'name avatar')
      .populate('itemId', 'title images category status');

    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    
    res.status(200).json({ claim });
  } catch (error) {
    next(error);
  }
};
