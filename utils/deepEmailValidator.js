import deepEmailValidator  from 'deep-email-validator';

export async function validateEmail(email) {
  return await deepEmailValidator.default(email, {
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: false // Set to true if you want SMTP check (slower)
  });
}


