import FoundItem from '../models/FoundItem.js';
import Match from '../models/Match.js';
import { runMatchingForItem } from '../services/match.service.js';
import { getImageEmbedding } from '../services/ai.service.js';
import { getQuestionsForCategory, validateAnswersForCategory } from '../services/questionGenerator.service.js';

export const create = async (req, res, next) => {
  try {
    const { 
      title, category, description, color, brand, 
      dateFound, location, additionalNotes, handoverLocation, verificationQuestions
    } = req.body;

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedQuestions = typeof verificationQuestions === 'string' ? JSON.parse(verificationQuestions) : verificationQuestions;

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 2) {
      return res.status(400).json({ error: 'Exactly two verification questions are required' });
    }

    const finalVerificationQuestions = parsedQuestions.map(q => ({
      question: q.question,
      answer: q.answer,
      answerType: q.answerType || 'generic'
    }));

    const imageEmbeddings = [];
    const images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push(file.filename);
        const embedding = await getImageEmbedding(file.path);
        if (embedding) {
          imageEmbeddings.push(embedding);
        }
      }
    }

    const foundItem = new FoundItem({
      userId: req.user._id,
      title, category, description, color, brand,
      dateFound,
      location: parsedLocation,
      images,
      imageEmbeddings,
      additionalNotes,
      handoverLocation,
      verificationQuestions: finalVerificationQuestions
    });

    await foundItem.save();

    // Run matching in background
    setImmediate(() => {
      runMatchingForItem(foundItem, 'found').catch(console.error);
    });

    const itemResponse = foundItem.toObject();
    delete itemResponse.imageEmbeddings;

    res.status(201).json({ foundItem: itemResponse });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { category, city, status = 'active', page = 1, limit = 20, search, user } = req.query;

    const query = { status };
    if (user) query.userId = user;
    if (category) query.category = category;
    if (city) query['location.city'] = { $regex: new RegExp(city, 'i') };
    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const skip = (page - 1) * limit;

    const items = await FoundItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-imageEmbeddings -verificationQuestions.answer');

    const total = await FoundItem.countDocuments(query);

    res.status(200).json({
      items,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('userId', 'name avatar reputationScore')
      .select('-imageEmbeddings -verificationQuestions.answer');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Increment views
    FoundItem.findByIdAndUpdate(item._id, { $inc: { views: 1 } }).exec();

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this item' });
    }

    const { title, description, color, brand, status, additionalNotes, handoverLocation } = req.body;
    
    if (title) item.title = title;
    if (description) item.description = description;
    if (color) item.color = color;
    if (brand) item.brand = brand;
    if (status) item.status = status;
    if (additionalNotes !== undefined) item.additionalNotes = additionalNotes;
    if (handoverLocation !== undefined) item.handoverLocation = handoverLocation;

    await item.save();

    res.status(200).json({ item });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this item' });
    }

    await FoundItem.findByIdAndDelete(req.params.id);
    await Match.deleteMany({ foundItemId: req.params.id });

    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};

export const getNearby = async (req, res, next) => {
  try {
    const { longitude, latitude, radius = 5, category } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Longitude and latitude required' });
    }

    const query = { status: 'available' };
    if (category) query.category = category;

    const items = await FoundItem.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          distanceField: 'distance',
          maxDistance: parseFloat(radius) * 1000,
          query,
          spherical: true
        }
      },
      {
        $project: { imageEmbeddings: 0 }
      }
    ]);

    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
};
