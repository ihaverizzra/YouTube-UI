/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchVideoById, incrementViews, fetchComments, addComment } from '../utils/supabaseClient';

const WatchPage = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [username, setUsername] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (videoId) {
      loadVideo();
      loadComments();
    }
  }, [videoId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const data = await fetchVideoById(videoId);
      setVideo(data);
      
      // Increment views
      await incrementViews(videoId);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await fetchComments(videoId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || !username.trim()) return;

    setSubmittingComment(true);
    try {
      const result = await addComment(videoId, username, commentText);
      if (result.success) {
        setCommentText('');
        await loadComments(); // Reload comments
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffTime = Math.abs(now - commentDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <h2 className='text-2xl font-bold mb-4'>Video not found</h2>
        <a href='/' className='text-blue-600 hover:underline'>Go back home</a>
      </div>
    );
  }

  return (
    <div className='md:mt-[4rem] max-sm:mt-[4.8rem] max-w-7xl mx-auto px-4 py-6'>
      {/* Video Player */}
      <div className='bg-black rounded-2xl overflow-hidden mb-6'>
        <video
          className='w-full aspect-video'
          src={video.video_url}
          controls
          autoPlay
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <div className='space-y-4'>
        <h1 className='text-2xl font-bold'>{video.title}</h1>
        
        <div className='flex items-center gap-4 text-gray-600'>
          <span>{formatViews(video.views)} views</span>
          <span>•</span>
          <span>{formatTime(video.created_at)}</span>
        </div>

        {video.description && (
          <div className='bg-gray-100 rounded-xl p-4'>
            <p className='text-gray-800 whitespace-pre-wrap'>{video.description}</p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className='mt-8'>
        <h2 className='text-xl font-bold mb-4'>{comments.length} Comments</h2>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className='mb-6 space-y-3'>
          <input
            type='text'
            placeholder='Your name'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
          <textarea
            placeholder='Add a comment...'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            rows={3}
            required
          />
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={() => {
                setCommentText('');
                setUsername('');
              }}
              className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submittingComment || !commentText.trim() || !username.trim()}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {submittingComment ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className='space-y-4'>
          {comments.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className='flex gap-3 p-4 bg-gray-50 rounded-lg'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold'>
                    {comment.username[0].toUpperCase()}
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='font-semibold'>{comment.username}</span>
                    <span className='text-gray-500 text-sm'>{formatTime(comment.created_at)}</span>
                  </div>
                  <p className='text-gray-800'>{comment.comment_text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
