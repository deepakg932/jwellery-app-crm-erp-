import { Link } from "react-router";
import logoDark from '@/assets/images/1000119756.jpg';
import logo from '@/assets/images/logo.png';
const AppLogo = ({
  height
}) => {
  return <>
      <Link to="/" className="logo-dark">
        <img src={logoDark} alt="dark logo" height={height ?? 38} />
      </Link>
      {/* <Link to="/" className="logo-light">
        <img src={logo} alt="logo" height={height ?? 28} />
      </Link> */}
    </>;
};
export default AppLogo;