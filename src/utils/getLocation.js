import axios from 'axios';

export const getUserCountryName = async () => {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    
    return response.data.country_name;
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
};

