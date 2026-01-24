const mailOptions = {
    from: '"Your Name" <you@example.com>', // sender
    to: 'friend@example.com',              // one or more recipients
    subject: 'Hello from Nodemailer',      // subject line
    text: 'Plain text version of the email',
    html: '<h1>Hello</h1><p>This is an <b>HTML</b> email.</p>',
  };
  