// import pug from 'pug';
// import fs from 'fs';

// const compiledFunction = pug.compileFile('./src/Views/verificationEmail.pug');

// const html = compiledFunction({
//   fullName: 'Delightsome Asolo Oluwadunsin',
//   verificationUrl:
//     'https://github.com/DSTIXX05/My-Learning-Journey/blob/main/Architecting%20with%20AWS%20Labs/delightsome-cloud.md',
//   logoUrl: 'https://via.placeholder.com/70x70?text=Logo',
//   supportEmail: 'support@saveourvotes.com',
// });

// fs.writeFileSync('./preview.html', html);
// console.log('Preview generated at preview.html');

import pug from 'pug';
import fs from 'fs';

// Test Sign-In Verification Email
const signinCompiledFunction = pug.compileFile(
  './src/Views/signinVerificationEmail.pug'
);

const signinHtml = signinCompiledFunction({
  fullName: 'Delightsome Asolo Oluwadunsin',
  verificationCode: '867492',
  verificationUrl:
    'http://localhost:3000/api/auth/verify-signin?code=867492&token=sample123',
  signinTime: new Date().toLocaleString(),
  deviceInfo: 'Chrome on Windows 11',
  location: 'Lagos, Nigeria',
  logoUrl: 'https://via.placeholder.com/70x70/4e48e0/ffffff?text=SOV',
  supportEmail: 'support@saveourvotes.com',
});

fs.writeFileSync('./signin-preview.html', signinHtml);
console.log(
  'Sign-in verification email preview generated at signin-preview.html'
);
