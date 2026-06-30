import React from 'react';

function CustomLoading() {
  return (
    <div>
      <div className="flex h-64 items-center justify-center">
        <div className="border-light h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    </div>
  );
}

export default CustomLoading;
