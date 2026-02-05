import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'mayor') {
      navigate('/mayor');
    } else if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profiles');
    }
  }, [navigate]);

  return null;
};

export default Index;
