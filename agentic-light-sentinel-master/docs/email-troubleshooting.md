# 🔒 Gmail Security & Email Delivery Troubleshooting Guide

## ✅ Gmail App Password Setup (REQUIRED)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Verify your phone number

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as device
4. Enter "Light Pollution Sentinel" as custom name
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
6. **Use this App Password in your SMTP_PASS environment variable**

⚠️ **Common Mistake**: Using your regular Gmail password instead of App Password

## 🚫 Email Delivery Issues Checklist

### A. Gmail Account Issues
- [ ] **App Password Generated**: Regular password won't work
- [ ] **2FA Enabled**: Required for App Passwords  
- [ ] **Account Not Suspended**: Check for any Gmail restrictions
- [ ] **Less Secure Apps**: Disabled (use App Passwords instead)

### B. SMTP Configuration Issues
- [ ] **Correct Port**: 587 (TLS) or 465 (SSL)
- [ ] **Host Correct**: `smtp.gmail.com`
- [ ] **TLS Settings**: `secure: false, requireTLS: true` for port 587
- [ ] **Auth Credentials**: App Password, not regular password

### C. Content & SPAM Filters
- [ ] **Valid From Address**: Use your Gmail address
- [ ] **Not Blacklisted**: Check if your domain/IP is blacklisted
- [ ] **Content Quality**: Avoid spam trigger words
- [ ] **HTML Validity**: Well-formed HTML content

### D. Rate Limiting
- [ ] **Gmail Limits**: Max 500 emails/day for free accounts
- [ ] **Rate Control**: Don't send too fast (use delays)
- [ ] **Connection Pooling**: Reuse connections efficiently

## 🧪 Testing Commands

### Test 1: Basic SMTP Test
```bash
# Run the minimal SMTP test
npx tsx scripts/minimal-smtp-test.ts your-email@gmail.com
```

### Test 2: Debug Email System  
```bash
# Test with enhanced debugging
npx tsx scripts/test-email-debug.ts
```

### Test 3: Manual Connection Test
```bash
# Test raw SMTP connection (Windows PowerShell)
Test-NetConnection smtp.gmail.com -Port 587

# Test raw SMTP connection (Command Prompt)
telnet smtp.gmail.com 587
```

### Test 4: OpenSSL SMTP Test
```bash
# Test SMTP with OpenSSL (if available)
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

## 🔍 Common Error Codes & Solutions

### Error 535: Authentication Failed
```
535-5.7.8 Username and Password not accepted
```
**Solution**: 
- Generate App Password
- Ensure 2FA is enabled
- Use App Password in SMTP_PASS

### Error 554: Message Rejected
```
554 Message rejected
```
**Solutions**:
- Check sender reputation
- Verify recipient email
- Review email content for spam indicators

### Error EAUTH: Authentication Error
```
EAUTH: Authentication error
```
**Solution**: Same as Error 535

### Error ECONNECTION: Connection Failed
```
ECONNECTION: Connection failed
```
**Solutions**:
- Check firewall settings
- Verify SMTP_HOST and SMTP_PORT
- Test network connectivity

## 📧 Email Best Practices

### Content Guidelines
- **Subject Line**: Clear, non-spammy
- **HTML**: Well-formatted, not too image-heavy
- **Text Alternative**: Include text version
- **Unsubscribe**: Include unsubscribe mechanism for bulk emails

### Technical Guidelines
- **SPF Records**: Set up for your domain
- **DKIM**: Enable domain signing
- **DMARC**: Set up email authentication policy
- **Reverse DNS**: Ensure proper PTR records

## 🚀 Production Recommendations

### For Development
- ✅ Use JSON transport for testing
- ✅ Test with real SMTP occasionally
- ✅ Log all email attempts
- ✅ Use test email addresses

### For Production
- 🔄 Consider using dedicated email service (SendGrid, Mailgun, SES)
- 🔄 Implement proper retry logic
- 🔄 Monitor email delivery rates
- 🔄 Set up email delivery webhooks

## 🛠️ Environment Variables Template

```env
# SMTP Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your_16_character_app_password

# Optional: Fallback settings
MUNICIPALITY_EMAIL=your-gmail@gmail.com
```

## 📊 Monitoring & Logging

### What to Log
- Email send attempts
- Success/failure rates
- Error codes and messages
- Response times
- Retry attempts

### Metrics to Track
- **Delivery Rate**: Successful sends / Total attempts
- **Bounce Rate**: Failed deliveries / Total sends  
- **Response Time**: Time to send email
- **Error Distribution**: Types of errors occurring

## 🆘 Troubleshooting Steps

1. **Verify Environment**: Run environment variable check
2. **Test Connection**: Use minimal SMTP test script
3. **Check Credentials**: Regenerate App Password if needed
4. **Test Locally**: Send test email to yourself
5. **Check Logs**: Review detailed error messages
6. **Monitor Gmail**: Check Gmail's error reporting
7. **Network Test**: Verify SMTP connectivity
8. **Contact Support**: Gmail support for persistent issues

## 📞 Support Resources

- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

*Last Updated: September 2025*