import React from 'react'
import { Field, Control, Input, Button } from 'rbx'
export const NewsletterForm = ({style}) => {
  return (
    <Field kind="addons" style={style}>
        <Control expanded>
          <Input type="email" placeholder="your@email.com" size="large"/>
        </Control>
        <Control>
          <Button color="primary" size="large">Sign Up</Button>
        </Control>
      </Field>
  )
}
export default NewsletterForm