import React from 'react'

import {
  Field, Control, Input, Button,
} from 'rbx'

import store from 'store2'

import { NEWSLETTER_SIGNUP_KEY } from '../constants'

export const NewsletterForm = ({ style }) => {
  const saveNewsletterSignup = () => {
    store.set(NEWSLETTER_SIGNUP_KEY, true)
  }

  return (
    <form action="https://live.us19.list-manage.com/subscribe/post?u=9b3f3f4e3e3eb0a5ffabcd7b5&amp;id=30a8139ec9" method="post">
      <Field kind="addons" style={style}>
        <Control expanded>
          <Input name="EMAIL" type="email" placeholder="your@email.com" size="large" />
        </Control>
        <Control>
          <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true"><input type="text" name="b_9b3f3f4e3e3eb0a5ffabcd7b5_30a8139ec9" tabIndex="-1" defaultValue="" /></div>
          <Button type="submit" color="primary" size="large" onClick={() => { saveNewsletterSignup() }}>Sign Up</Button>
        </Control>
      </Field>
    </form>
  )
}

export default NewsletterForm
