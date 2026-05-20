import React, { useState, useEffect } from 'react';
import logo from '../assets/apmc.png';

const SplashScreen = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideAt = 2200;
    const fadeAt = 1800;
    const fadeTimer = setTimeout(() => setVisible(false), fadeAt);
    const finishTimer = setTimeout(() => onFinish?.(), hideAt);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className="splash-screen-enter fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a4d7a] transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="splash-logo-enter flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/90 bg-[#1a4d7a] p-1 sm:h-32 sm:w-32">
            <img
              src={logo}
              alt=""
              className="h-full w-full rounded-full object-contain p-2"
            />
          </div>
        </div>
        <div className="splash-text-enter flex flex-col items-center text-center">
          <p className="text-xl font-medium tracking-wide text-white sm:text-2xl">
            <span className="relative inline-block border-b-2 border-white/90 pb-0.5">
              Amalgated
            </span>
            {' Properties'}
          </p>
          <p className="mt-1 text-sm text-white/90 sm:text-base">
            Management Corporation
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
