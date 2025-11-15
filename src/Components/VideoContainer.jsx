/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { fetchVideos } from '../utils/supabaseClient';
import { NavLink } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (timestamp) => {
    const now = new Date();
    const videoDate = new Date(timestamp);
    const diffTime = Math.abs(now - videoDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div 
      className='cursor-pointer md:w-[40.4vw] lg:w-[29vw] max-sm:w-[100%]'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='relative'>
        <div className='bg-gray-900 rounded-2xl overflow-hidden'>
          {isHovered ? (
            <video
              src={video.video_url}
              className='w-full h-full object-cover'
              autoPlay
              muted
              loop
            />
          ) : (
            <div className='w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center'>
              <div className='text-white text-4xl opacity-50'>▶</div>
            </div>
          )}
        </div>
      </div>
      
      <div className='pt-3 space-y-2 max-sm:text-justify md:mx-auto mx-[1.2rem] md:text-justify'>
        <h1 className='font-bold text-[15px] line-clamp-2'>
          {video.title}
        </h1>
        <div className='text-gray-600 text-sm space-y-1'>
          <div className='flex items-center gap-2'>
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatTime(video.created_at)}</span>
          </div>
          {video.description && (
            <p className='text-gray-500 text-xs line-clamp-2'>
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoContainer = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await fetchVideos();
      setVideos(data);
      setError(null);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='md:flex md:flex-wrap max-sm:flex max-sm:flex-col lg:gap-x-5 md:gap-x-6 md:gap-y-10 max-sm:gap-y-10'>
        {Array(12).fill('').map((_, index) => (
          <div key={index} className='cursor-pointer md:w-[40.4vw] lg:w-[29vw] max-sm:w-[100%] animate-pulse'>
            <div className='bg-gray-300 rounded-2xl w-full aspect-video'></div>
            <div className='pt-3 space-y-2'>
              <div className='bg-gray-300 h-6 rounded'></div>
              <div className='bg-gray-300 h-4 w-3/4 rounded'></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center py-20'>
        <div className='text-red-600 text-xl mb-4'>⚠️ {error}</div>
        <button
          onClick={loadVideos}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <div className='text-6xl mb-4'>🎥</div>
        <h2 className='text-2xl font-bold mb-2'>No videos yet</h2>
        <p className='text-gray-600 mb-6'>Be the first to upload a video!</p>
      </div>
    );
  }

  return (
    <div className='md:flex md:flex-wrap max-sm:flex max-sm:flex-col lg:gap-x-5 md:gap-x-6 md:gap-y-10 max-sm:gap-y-10'>
      {videos.map((video) => (
        <NavLink to={`/watch?v=${video.id}`} key={video.id}>
          <VideoCard video={video} />
        </NavLink>
      ))}
    </div>
  );
};

export default VideoContainer;
