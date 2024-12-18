import LogoImg from '../../../assets/images/logo.png';
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo">
      <img src={LogoImg} alt="Shop Logo" />
    </div>
  );
};

export default Logo;
