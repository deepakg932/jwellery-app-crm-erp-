import { userDropdownItems } from '@/layouts/components/data';
import { Link, useNavigate } from "react-router";
import { Fragment } from 'react';
import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { TbChevronDown } from 'react-icons/tb';
import user3 from '@/assets/images/users/user-3.jpg';

const UserProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('__UBOLD_REACT_CONFIG__');

    sessionStorage.clear();
    navigate('/auth-2/sign-in');
  };

  return (
    <div className="topbar-item nav-user">
      <Dropdown align="end">
        <DropdownToggle as={'a'} className="topbar-link dropdown-toggle drop-arrow-none px-2">
          <img 
            src={user3} 
            width="32" 
            height="32" 
            className="rounded-circle me-lg-2 d-flex" 
            alt="user-image" 
          />
          <div className="d-lg-flex align-items-center gap-1 d-none">
            <h5 className="my-0">Geneva</h5>
            <TbChevronDown className="align-middle" />
          </div>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {userDropdownItems.map((item, idx) => (
            <Fragment key={idx}>
              {item.isHeader ? (
                <div className="dropdown-header noti-title">
                  <h6 className="text-overflow m-0">{item.label}</h6>
                </div>
              ) : item.isDivider ? (
                <DropdownDivider />
              ) : item.label === "Log Out" ? (
                <DropdownItem 
                  as="button"
                  className={item.class}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  {item.icon && (
                    <item.icon className="me-2 fs-17 align-middle" />
                  )}
                  <span className="align-middle">{item.label}</span>
                </DropdownItem>
              ) : (
                <DropdownItem 
                  as={Link} 
                  to={item.url ?? ''} 
                  className={item.class}
                >
                  {item.icon && (
                    <item.icon className="me-2 fs-17 align-middle" />
                  )}
                  <span className="align-middle">{item.label}</span>
                </DropdownItem>
              )}
            </Fragment>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default UserProfile;