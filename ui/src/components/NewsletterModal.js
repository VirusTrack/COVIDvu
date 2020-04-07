import React from 'react'
import {
  Box, Title, Tag, Column,
} from 'rbx'

import NewsletterForm from './NewsletterForm'

export const NewsletterModal = ({ className, style, handleModalClose = false }) => {
  const handleClose = () => {
    if (handleModalClose) handleModalClose(false)
  }

  return (
    <>
      {handleModalClose && (
      <div style={{
        display: 'block',
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,.75)',
        zIndex: 45,

      }}
      />
      )}
      <Box
        className={className}
        style={{
          position: handleModalClose ? 'fixed' : '',
          top: handleModalClose ? '50%' : '',
          left: handleModalClose ? '50%' : '',
          right: 0,
          transform: handleModalClose ? 'translateY(-50%) translateX(-50%)' : '',
          zIndex: handleModalClose ? 50 : '',
          padding: '1.5rem',
          width: handleModalClose ? 'calc(100% - 3rem)' : '',
          maxWidth: handleModalClose ? '45rem' : null,
          ...style,
        }}
      >
        <Column.Group breakpoint="mobile" style={{ marginBottom: 0 }}>
          <Column>
            <Title
              style={{
                marginBottom: 0, color: '#0F0F0F', fontWeight: 600, textAlign: 'left', fontFamily: 'Archivo', fontSize: '2.4rem',
              }}
              as="div"
            >
              Sign up for our Newsletter
            </Title>
          </Column>
          {handleModalClose && (
          <Column narrow>
            <Tag
              delete
              size="large"
              onClick={handleClose}
              style={{
                display: 'block', marginLeft: 'auto', color: '#444444', background: '#EFEFEF',
              }}
            />
          </Column>
          )}
        </Column.Group>

        <p style={{ paddingTop: 0, marginBottom: 0, textAlign: 'left' }}>
          Stay informed about the Coronavirus pandemic by subscribing to our weekly newsletter.
        </p>

        <NewsletterForm />
      </Box>
    </>
  )
}
export default NewsletterModal
