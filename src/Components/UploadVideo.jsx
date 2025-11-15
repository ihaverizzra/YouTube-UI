/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { MdCloudUpload } from 'react-icons/md';
import { uploadVideo } from '../utils/supabaseClient';

const UploadVideo = ({ isOpen, onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setError('');
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setError('');
      } else {
        setError('Please drop a valid video file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile || !title.trim()) {
      setError('Please provide a video file and title');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(10);

    try {
      // Simulate progress (actual progress tracking would need more complex implementation)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await uploadVideo(videoFile, title, description);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setTimeout(() => {
          handleClose();
          if (onUploadSuccess) onUploadSuccess();
        }, 1000);
      } else {
        setError(result.error || 'Upload failed. Please try again.');
        setUploadProgress(0);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setError('');
    setUploadProgress(0);
    setUploading(false);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <IoCloseOutline className="w-8 h-8" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Video File *
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <MdCloudUpload className="w-16 h-16 text-gray-400 mb-4" />
                {videoFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(videoFile.size)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setVideoFile(null);
                      }}
                      disabled={uploading}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop your video here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports MP4, WebM, MOV (max 500MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              maxLength={100}
              placeholder="Enter video title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              maxLength={500}
              rows={4}
              placeholder="Tell viewers about your video..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !videoFile || !title.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;
