const { PrismaClient } = require('D:/Programing/Journal/node_modules/.pnpm/@prisma+client@6.19.3_prism_1d040ab5215f59f0e27ddee7f0cf082e/node_modules/@prisma/client');
const p = new PrismaClient();

p.user.findUnique({ 
  where: { email: 'vinays7.kushwaha@gmail.com' }, 
  select: { email: true, name: true, googleId: true, passwordHash: true, createdAt: true } 
}).then(u => { 
  if (!u) { 
    console.log('No account found with this email.'); 
  } else { 
    console.log('Account found!');
    console.log('Email:', u.email); 
    console.log('Name:', u.name); 
    console.log('Created:', u.createdAt); 
    console.log('Google Sign-In:', u.googleId ? 'YES - use Continue with Google' : 'NO'); 
    console.log('Has password set:', u.passwordHash ? 'YES - can login with email+password' : 'NO - no password set'); 
  } 
}).catch(console.error).finally(() => p.$disconnect());
