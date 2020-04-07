import React, { useState } from 'react'
import { Box, Title, Tag, Column, Button } from 'rbx'

import NewsletterModal from './NewsletterModal'

export const NewsletterModalButton = ({buttonCopy, size, color, style}) => {
  const [newsletterModal, setNewsletterModal] = useState(false)

  const handleModalClose = () => {
    setNewsletterModal(false)
  }
  const handleModalOpen = () => {
    setNewsletterModal(true)
  }

  return (
    <>
    <Button style={style} size={size ? size : 'medium'} color={color ? color : 'primary'} onClick={handleModalOpen}>{buttonCopy ? buttonCopy : 'Newsletter Signup'}</Button>
    {newsletterModal && <NewsletterModal handleModalClose={handleModalClose} />}
    </>
  )
}
export default NewsletterModalButton