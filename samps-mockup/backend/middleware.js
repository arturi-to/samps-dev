module.exports = (req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  
  // Middleware para simular OTP
  if (req.method === 'POST' && req.url === '/generate-otp') {
    const otp = Math.floor(100000 + Math.random() * 900000);
    // En producción, enviar OTP por SMS/Email
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n*** OTP para alumno ${req.body?.rut || 'N/A'}: ${otp} ***\n`);
    }
    res.json({ otp, success: true });
    return;
  }
  
  next();
};