import React from 'react';

function ArrowBackIcon({ color = '#1A1A1A' }) {
  return (
    <>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="25" height="25" rx="12.5" fill={color} />
        <rect x="0.5" y="0.5" width="25" height="25" rx="12.5" stroke="white" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.1653 9.23431C15.4777 9.54673 15.4777 10.0533 15.1653 10.3657L12.531 13L15.1653 15.6343C15.4777 15.9467 15.4777 16.4533 15.1653 16.7657C14.8529 17.0781 14.3463 17.0781 14.0339 16.7657L10.8339 13.5657C10.5215 13.2533 10.5215 12.7467 10.8339 12.4343L14.0339 9.23431C14.3463 8.9219 14.8529 8.9219 15.1653 9.23431Z"
          fill="white"
        />
      </svg>
    </>
  );
}

export default ArrowBackIcon;
