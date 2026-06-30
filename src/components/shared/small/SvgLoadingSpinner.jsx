import React from 'react';

const SvgLoadingSpinner = ({ size = '2.8rem', color = '#21ccb0' }) => {
  const style = {
    '--uib-size': size,
    '--uib-color': color,
  };

  return (
    <div className="dot-spinner" style={style}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`dot-spinner__dot dot-${i + 1}`}></div>
      ))}
    </div>
  );
};

export default SvgLoadingSpinner;

// export default SvgLoadingSpinner;
//  {lo && <SvgLoadingSpinner size="20px" />}
