import { useAuth } from '@/context/AuthContext';
import Account from "./Account/Account";
import Links from "./Links/Links";
import Logo from "./Logo/Logo";
import Search from "./Search/Search";
import CartIcon from "../NavBar/CartIcon/CartIcon";
import "./NavBar.css";

const NavBar = () => {
  const { user } = useAuth();
  const isBuyer = user?.role?.toUpperCase() === 'BUYER';

  return (
    <div className="sub-container">
      <div className="nav-container">
        <Logo />
        <Links />
        {/* <Search /> */}
        {isBuyer && <CartIcon />}
        <Account />
      </div>
    </div>
  );
};

export default NavBar;
