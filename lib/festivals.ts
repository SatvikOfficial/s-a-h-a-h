// Hindu festival dates for the S.A.H.A.S. calendar.
// Stored as { 'YYYY-MM-DD': { hi, en }[] } so the calendar can render precisely.
// These cover the years 2025–2027.

export interface Festival {
  hi: string
  en: string
}

export const festivals: Record<string, Festival[]> = {
  // ============ 2025 ============
  '2025-01-14': [{ hi: 'मकर संक्रांति', en: 'Makar Sankranti' }],
  '2025-01-29': [{ hi: 'वसंत पंचमी', en: 'Vasant Panchami' }],
  '2025-02-12': [{ hi: 'रथ सप्तमी', en: 'Ratha Saptami' }],
  '2025-02-26': [{ hi: 'महाशिवरात्रि', en: 'Maha Shivaratri' }],
  '2025-03-14': [{ hi: 'होलिका दहन', en: 'Holika Dahan' }],
  '2025-03-30': [{ hi: 'राम नवमी', en: 'Rama Navami' }],
  '2025-04-13': [{ hi: 'उगादि', en: 'Ugadi' }],
  '2025-04-14': [{ hi: 'अंबेडकर जयंती / तमिल नव वर्ष', en: 'Ambedkar Jayanti / Tamil New Year' }],
  '2025-06-27': [{ hi: 'रथ यात्रा', en: 'Ratha Yatra' }],
  '2025-07-12': [{ hi: 'गुरु पूर्णिमा', en: 'Guru Purnima' }],
  '2025-08-09': [{ hi: 'रक्षा बंधन', en: 'Raksha Bandhan' }],
  '2025-08-16': [{ hi: 'जन्माष्टमी', en: 'Janmashtami' }],
  '2025-09-01': [{ hi: 'गणेश चतुर्थी', en: 'Ganesh Chaturthi' }],
  '2025-09-22': [{ hi: 'विजयादशमी / दशहरा', en: 'Vijayadashami / Dussehra' }],
  '2025-10-13': [{ hi: 'नरक चतुर्दशी', en: 'Naraka Chaturdashi' }],
  '2025-10-14': [{ hi: 'दीपावली', en: 'Diwali' }],
  '2025-10-16': [{ hi: 'गोवर्धन पूजा', en: 'Govardhan Puja' }],
  '2025-11-08': [{ hi: 'छठ पूजा', en: 'Chhath Puja' }],
  '2025-11-20': [{ hi: 'कार्तिक पूर्णिमा', en: 'Kartik Purnima' }],

  // ============ 2026 ============
  '2026-01-14': [{ hi: 'मकर संक्रांति', en: 'Makar Sankranti' }],
  '2026-02-17': [{ hi: 'वसंत पंचमी', en: 'Vasant Panchami' }],
  '2026-03-02': [{ hi: 'महाशिवरात्रि', en: 'Maha Shivaratri' }],
  '2026-03-29': [{ hi: 'राम नवमी', en: 'Rama Navami' }],
  '2026-04-01': [{ hi: 'होलिका दहन', en: 'Holika Dahan' }],
  '2026-04-25': [{ hi: 'अंबेडकर जयंती', en: 'Ambedkar Jayanti' }],
  '2026-07-15': [{ hi: 'गुरु पूर्णिमा', en: 'Guru Purnima' }],
  '2026-08-25': [{ hi: 'रक्षा बंधन', en: 'Raksha Bandhan' }],
  '2026-09-01': [{ hi: 'जन्माष्टमी', en: 'Janmashtami' }],
  '2026-09-24': [{ hi: 'विजयादशमी / दशहरा', en: 'Vijayadashami / Dussehra' }],
  '2026-11-08': [{ hi: 'दीपावली', en: 'Diwali' }],
  '2026-11-10': [{ hi: 'गोवर्धन पूजा', en: 'Govardhan Puja' }],

  // ============ 2027 ============
  '2027-01-14': [{ hi: 'मकर संक्रांति', en: 'Makar Sankranti' }],
  '2027-02-06': [{ hi: 'वसंत पंचमी', en: 'Vasant Panchami' }],
  '2027-03-12': [{ hi: 'महाशिवरात्रि', en: 'Maha Shivaratri' }],
  '2027-03-25': [{ hi: 'राम नवमी', en: 'Rama Navami' }],
  '2027-04-14': [{ hi: 'अंबेडकर जयंती', en: 'Ambedkar Jayanti' }],
  '2027-08-16': [{ hi: 'रक्षा बंधन', en: 'Raksha Bandhan' }],
  '2027-09-03': [{ hi: 'जन्माष्टमी', en: 'Janmashtami' }],
  '2027-10-12': [{ hi: 'विजयादशमी / दशहरा', en: 'Vijayadashami / Dussehra' }],
  '2027-10-29': [{ hi: 'दीपावली', en: 'Diwali' }],
}
