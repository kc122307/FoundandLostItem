import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '../../utils/formatters';
import { ITEM_CATEGORIES } from '../../utils/constants';

const ItemCard = ({ item, type = 'lost' }) => {
  const category = ITEM_CATEGORIES.find(c => c.id === item.category);
  const imageUrl = item.images?.length > 0 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/items/${item.images[0]}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-indigo-500/50 transition-all duration-300"
    >
      <Link to={`/item/${type}/${item._id}`} className="block relative h-48 overflow-hidden group">
        <img 
          src={imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-md backdrop-blur-md bg-black/50 ${
            type === 'lost' ? 'text-rose-400 border border-rose-500/30' : 'text-emerald-400 border border-emerald-500/30'
          }`}>
            {type.toUpperCase()}
          </span>
          <span className="px-2 py-1 text-xs rounded-md backdrop-blur-md bg-black/50 text-gray-200 border border-gray-600/50 flex items-center gap-1">
            {category?.icon} {category?.label}
          </span>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{item.title}</h3>
        </div>
        
        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
          {item.description}
        </p>
        
        <div className="flex items-center text-xs text-slate-500 space-x-4 border-t border-slate-200 pt-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[120px]">{item.location?.address || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center ml-auto">
            <svg className="w-4 h-4 mr-1 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTimeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
