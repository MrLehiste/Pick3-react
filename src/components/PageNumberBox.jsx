import React from 'react';

const PageNumberBox = ({ page }) => {
  return (
    <div className="fixed top-0 right-0 z-20 bg-blue-500 text-white font-medium text-xl p-4 rounded-lg shadow-lg mt-1 mr-1 z-10">
      Page {page}
    </div>
  );
};

export default PageNumberBox;
