import React, { useState } from 'react';
import { Button } from 'rbx';

import NewsletterModal from './NewsletterModal';

export const NewsletterModalButton = ({
  buttonCopy, size, color, style,
}) => {
  const [newsletterModal, setNewsletterModal] = useState(false);

  const handleModalClose = () => {
    setNewsletterModal(false);
  };
  const handleModalOpen = () => {
    setNewsletterModal(true);
  };

  return (
    <>
      <Button style={style} size={size || 'medium'} color={color || 'primary'} onClick={handleModalOpen}>{buttonCopy || 'Newsletter Signup'}</Button>
      {newsletterModal && <NewsletterModal handleModalClose={handleModalClose} />}
    </>
  );
};
export default NewsletterModalButton;
