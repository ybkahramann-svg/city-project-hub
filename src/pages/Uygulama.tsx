import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Uygulama = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'mayor') {
      navigate('/mayor', { replace: true });
    } else if (userRole === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/profiles', { replace: true });
    }
  }, [navigate]);

  return null;
};

export default Uygulama;
