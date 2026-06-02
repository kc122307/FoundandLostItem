import User from '../models/User.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { name, mobile, college, city } = req.body;
    
    const updateData = { name, mobile, college, city };
    if (req.file) {
      updateData.avatar = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select('-password');
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar city college reputationScore badges isVerified createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
