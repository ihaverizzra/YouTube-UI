/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { CgMenuLeftAlt } from "react-icons/cg";
import { RiVideoAddLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { toggleMenu } from '../utils/appSlice';
import { useNavigate } from 'react-router-dom';
import UploadVideo from './UploadVideo';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);

  function handleLogoClick() {
    navigate("/");
  }

  const toggleMenuHandler = () => {
    dispatch(toggleMenu());
  };

  const handleUploadSuccess = () => {
    // Refresh the page or update video list
    navigate("/");
    window.location.reload(); // Simple refresh to show new video
  };

  return (
    <>
      <nav className='fixed flex justify-between items-center md:mx-auto md:px-[1.35rem] max-sm:px-[0.35rem] max-sm:pr-3 lg:pr-7 md:pr-6 max-sm:mx:auto max-sm:h-[4.6rem] md:h-[3.8rem] bg-white w-[100vw] z-30 shadow-md'>
        
        {/* Logo and Menu Icon */}
        <div className='flex items-center md:gap-3 max-sm:gap-2'>
          <div className='p-1 hover:bg-gray-200 hover:rounded-full transition-colors'>
            <CgMenuLeftAlt 
              className='text-3xl cursor-pointer text-black md:mt-[1px]' 
              onClick={toggleMenuHandler} 
            />
          </div>
          <div 
            onClick={handleLogoClick}
            className='cursor-pointer flex items-center gap-2'
          >
            <div className='bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xl px-3 py-1 rounded-lg shadow-lg'>
              VidHub
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setShowUploadModal(true)}
            className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition-all hover:shadow-lg max-sm:px-3'
          >
            <RiVideoAddLine className='text-xl' />
            <span className='max-sm:hidden'>Upload</span>
          </button>
        </div>
      </nav>

      {/* Upload Modal */}
      <UploadVideo
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};

export default Header;
