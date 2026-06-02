import Challenge from '../models/Challenge.js';
import LostItem from '../models/LostItem.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { createNotification } from '../services/notification.service.js';
import { scoreOwnerAnswers } from '../services/verification.service.js';

export const createChallenge = async (req, res, next) => {
  try {
    const { lostItemId, questions } = req.body;

    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) return res.status(404).json({ error: 'Lost item not found' });

    if (lostItem.status !== 'active') {
      return res.status(400).json({ error: 'Item is no longer active' });
    }

    if (lostItem.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot challenge yourself' });
    }

    // Ensure finder hasn't already sent a challenge for this item
    const existingChallenge = await Challenge.findOne({
      lostItemId,
      finderId: req.user._id,
      status: { $ne: 'rejected' } // Only block if pending or approved
    });

    if (existingChallenge) {
      return res.status(409).json({ error: 'You have already challenged the owner of this item' });
    }

    const challenge = new Challenge({
      lostItemId,
      finderId: req.user._id,
      ownerId: lostItem.userId,
      questions
    });

    await challenge.save();

    await createNotification({
      userId: lostItem.userId,
      title: 'Someone found your item!',
      body: 'A user claims to have found your item. Answer their questions to prove it is yours and get in touch.',
      type: 'challenge_received',
      data: { challengeId: challenge._id }
    });

    res.status(201).json({ message: 'Challenge sent to the owner', challenge });
  } catch (error) {
    next(error);
  }
};

export const answerChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ownerAnswers } = req.body;

    const challenge = await Challenge.findById(id).populate('lostItemId');
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    if (challenge.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to answer this challenge' });
    }

    if (challenge.status !== 'pending_owner_response') {
      return res.status(400).json({ error: 'This challenge is no longer pending' });
    }

    // Format for verification service (it expects an item object with verificationQuestions)
    const mockItem = {
      verificationQuestions: challenge.questions.map((q, idx) => ({
        question: q.question,
        answer: q.expectedAnswer
      }))
    };

    const result = scoreOwnerAnswers(mockItem, ownerAnswers);

    challenge.attemptNumber += 1;
    challenge.score = result.score;
    challenge.ownerAnswers = ownerAnswers;

    let chatId = null;

    if (result.approved) {
      challenge.status = 'approved';
      challenge.resolvedAt = Date.now();

      // Create Chat
      let chat = await Chat.findOne({ participants: { $all: [req.user._id, challenge.finderId] }, lostItemId: challenge.lostItemId._id });
      if (!chat) {
        chat = new Chat({
          participants: [req.user._id, challenge.finderId],
          lostItemId: challenge.lostItemId._id
        });
        await chat.save();
      }
      chatId = chat._id;

      // Update Lost Item
      challenge.lostItemId.status = 'matched';
      await challenge.lostItemId.save();

      // Reward points
      await User.findByIdAndUpdate(req.user._id, { $inc: { reputationScore: 10 } });
      await User.findByIdAndUpdate(challenge.finderId, { $inc: { reputationScore: 15 } });

      // Notify Finder
      await createNotification({
        userId: challenge.finderId,
        title: 'Challenge Completed',
        body: 'The owner answered your questions correctly! You can now chat with them to arrange a handover.',
        type: 'challenge_approved',
        data: { chatId }
      });
      
      // Notify Owner (in case they need confirmation)
      await createNotification({
        userId: req.user._id,
        title: 'You verified your item!',
        body: 'You successfully answered the finders questions. Chat with them now.',
        type: 'challenge_approved',
        data: { chatId }
      });
    } else {
      if (challenge.attemptNumber < 2) {
        challenge.canRetry = true;
        challenge.status = 'pending_owner_response';
      } else {
        challenge.canRetry = false;
        challenge.status = 'rejected';
        challenge.resolvedAt = Date.now();

        await createNotification({
          userId: challenge.finderId,
          title: 'Challenge Failed',
          body: 'The owner failed to answer your questions correctly after multiple attempts.',
          type: 'challenge_rejected',
          data: { challengeId: challenge._id }
        });
      }
    }

    await challenge.save();

    res.status(200).json({
      approved: result.approved,
      score: result.score,
      canRetry: challenge.canRetry,
      chatId,
      feedback: result.feedback,
      message: result.approved ? 'Verified successfully! You can now chat with the finder.' : (challenge.canRetry ? 'Some answers were incorrect. Try once more.' : 'Verification failed. The answers did not match.')
    });

  } catch (error) {
    next(error);
  }
};

export const getMyChallenges = async (req, res, next) => {
  try {
    const receivedChallenges = await Challenge.find({ ownerId: req.user._id })
      .populate('lostItemId', 'title images category')
      .populate('finderId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Strip expected answers from received challenges so the owner can't cheat
    const safeReceived = receivedChallenges.map(c => {
      c.questions = c.questions.map(q => ({
        _id: q._id,
        question: q.question
      }));
      return c;
    });

    const sentChallenges = await Challenge.find({ finderId: req.user._id })
      .populate('lostItemId', 'title images category')
      .sort({ createdAt: -1 });

    res.status(200).json({ received: safeReceived, sent: sentChallenges });
  } catch (error) {
    next(error);
  }
};

export const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('lostItemId', 'title images category dateLost location')
      .populate('finderId', 'name avatar')
      .populate('ownerId', 'name avatar');
      
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    
    // The owner should never see the exact expected answers
    if (req.user._id.toString() === challenge.ownerId._id.toString()) {
      const safeChallenge = challenge.toObject();
      safeChallenge.questions = safeChallenge.questions.map(q => ({
        _id: q._id,
        question: q.question
      }));
      return res.status(200).json({ challenge: safeChallenge });
    }

    res.status(200).json({ challenge });
  } catch (error) {
    next(error);
  }
};
