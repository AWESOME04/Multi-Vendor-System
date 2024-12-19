import LogoImg from '../../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo">
      <Link to='/'>
        <img src={LogoImg} alt="Shop Logo" />
      </Link>
      
    </div>
  );
};

export default Logo;
