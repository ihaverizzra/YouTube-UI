/* eslint-disable no-unused-vars */
import React from 'react';
import { MdHomeFilled } from 'react-icons/md';
import { CgMenuLeftAlt } from "react-icons/cg";
import { useDispatch, useSelector } from 'react-redux';
import { toggleMenu } from '../utils/appSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const SideBar = () => {
  const isMenuOpen = useSelector((store) => store.app.isMenuOpen);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMenuHandler = () => {
    dispatch(toggleMenu());
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const SideBarStyle = isMenuOpen
    ? 'sidebar-open fixed left-0 md:w-[30vw] lg:w-[19vw] max-sm:w-[60vw] h-full bg-white z-50 text-sm md:top-0 max-sm:top-0 shadow-gray-700 shadow-2xl transition-shadow duration-300'
    : 'fixed max-sm:hidden md:flex-col text-xs space-y-6 mt-[73px] ml-1';

  // Hide sidebar on watch page when closed
  if (!isMenuOpen && location.pathname === '/watch') {
    return null;
  }

  // Minimal sidebar when closed
  if (!isMenuOpen) {
    return (
      <div className={SideBarStyle}>
        <div className="hover:bg-gray-100 hover:rounded-lg cursor-pointer flex flex-col items-center gap-1" onClick={() => navigate("/")}>
          <MdHomeFilled className="w-5 h-7" />
          <span className="font-bold">Home</span>
        </div>
      </div>
    );
  }

  // Full sidebar when open
  return (
    <div className={SideBarStyle}>
      <div className='fixed flex items-center md:w-[30vw] lg:w-[19vw] max-sm:w-[60vw] md:gap-1 max-sm:gap-1 bg-white px-[1.35rem] md:h-[3.8rem] max-sm:px-[0.35rem] max-sm:h-[4.6rem]'>
        <div className='md:p-1 md:mt-[0.1rem] max-sm:p-1 hover:bg-gray-200 hover:rounded-full'>
          <CgMenuLeftAlt className='text-3xl cursor-pointer text-black' onClick={toggleMenuHandler} />
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
      
      <div className='flex flex-col gap-y-1 md:px-4 mt-[70px] h-screen overflow-y-auto max-sm:mt-[80px] py-8 sidebar'>
        <ul>
          <li 
            className='list-none pl-[13px] py-3 rounded-lg cursor-pointer hover:bg-gray-100 lg:hover:w-[16.2vw] md:hover:w-[25.5vw] hover:w-[58.5vw] bg-gray-100 lg:w-[16.2vw] md:w-[25.5vw] max-sm:w-[58.5vw]' 
            onClick={() => navigate("/")}
          >
            <div className='flex items-center gap-5'>
              <MdHomeFilled className='w-5 h-8' />
              <span>Home</span>
            </div>
          </li>
        </ul>

        <div className='my-4 w-52'>
          <hr />
        </div>

        <div className='text-gray-500 text-sm px-4'>
          <p className='mb-2'>Upload videos and share with everyone!</p>
          <p className='text-xs'>No account needed.</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
