export const formatRut = (rut) => {
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 2) return cleanRut;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
};

export const validateRut = (rut) => {
  const cleanRut = rut.replace(/[.-]/g, '');
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toLowerCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDv = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'k' : (11 - remainder).toString());
  
  return dv === calculatedDv;
};