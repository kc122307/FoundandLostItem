import User from '../models/User.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Match from '../models/Match.js';
import Claim from '../models/Claim.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastSeen: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const totalLostItems = await LostItem.countDocuments();
    const activeLostItems = await LostItem.countDocuments({ status: 'active' });

    const totalFoundItems = await FoundItem.countDocuments();
    const availableFoundItems = await FoundItem.countDocuments({ status: 'available' });

    const totalMatches = await Match.countDocuments();
    const confirmedMatches = await Match.countDocuments({ status: 'confirmed' });
    const recoveryRate = totalMatches > 0 ? ((confirmedMatches / totalMatches) * 100).toFixed(2) : 0;

    const totalClaims = await Claim.countDocuments();
    const approvedClaims = await Claim.countDocuments({ status: 'approved' });

    const itemsByCategory = await LostItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const itemsByCity = await LostItem.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } }
    ]);

    const recentActivity = await Match.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('lostItemId', 'title')
      .populate('foundItemId', 'title');

    res.status(200).json({
      totalUsers, activeUsers,
      totalLostItems, activeLostItems,
      totalFoundItems, availableFoundItems,
      totalMatches, confirmedMatches, recoveryRate,
      totalClaims, approvedClaims,
      itemsByCategory, itemsByCity,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, isBanned, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { email: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: reason },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: null },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const { itemId, itemType } = req.params;
    
    if (itemType === 'lost') {
      await LostItem.findByIdAndDelete(itemId);
      await Match.deleteMany({ lostItemId: itemId });
    } else {
      await FoundItem.findByIdAndDelete(itemId);
      await Match.deleteMany({ foundItemId: itemId });
    }
    
    await Claim.deleteMany({ itemId });
    
    res.status(200).json({ message: 'Item and related records deleted' });
  } catch (error) {
    next(error);
  }
};

export const getPendingItems = async (req, res, next) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentLost = await LostItem.find({ createdAt: { $gte: oneDayAgo } })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
      
    const recentFound = await FoundItem.find({ createdAt: { $gte: oneDayAgo } })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ recentLost, recentFound });
  } catch (error) {
    next(error);
  }
};
