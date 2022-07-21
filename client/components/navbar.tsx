import Link from "next/link";
import { IconContext } from "react-icons";
import { FaCog, FaHeart, FaBars, FaRegBell } from "react-icons/fa";
import { useUserContext } from "./UserContext";

const logoutButton = () => {
  return (
    <Link href="/logout">
      <a className="button">Log out</a>
    </Link>
  );
};

const loginSignupButtons = () => {
  return (
    <>
      <Link href="/signup">
        <a className="button is-primary">Sign up</a>
      </Link>
      <Link href="/login">
        <a className="button">Log in</a>
      </Link>
    </>
  );
};
const NavbarComponent = (args: any) => {
  // Token state
  const { tokens } = useUserContext();
  return (
    <div className="column is-narrow">
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item pt-3" href="/">
          <span className="icon is-medium">
            <IconContext.Provider
              value={{ size: "1.2rem", className: "react-icons" }}
            >
              <div>
                <FaHeart />
              </div>
            </IconContext.Provider>
          </span>
        </a>
        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar-burger-button"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div className="navbar-menu is-hidden mobile-menu" id="navbar-mobile">
        <div className="navbar-end">
          <a className="navbar-item" href="/camera">
            Take picture
          </a>
          <a className="navbar-item" href="/newpost">
            New post
          </a>
          <a className="navbar-item" href="/profile">
            Profile
          </a>
          <a className="navbar-item" href="/controlpanel">
            Control panel
          </a>
          <hr className="navbar-divider" />
          <a className="navbar-item" href="/logout">
            Logout
          </a>
          <a className="navbar-item" href="/signup">
            Sign up
          </a>
          <a className="navbar-item" href="/login">
            Login
          </a>
        </div>
      </div>
      <div className="navbar-menu">
        <div className="navbar-start">
          <a className="navbar-item" href="/camera">
            Link 1
          </a>
          <a className="navbar-item" href="/newpost">
            Link 2
          </a>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons" id="buttons">
              {tokens.accessToken ? logoutButton() : loginSignupButtons()}
            </div>
          </div>
          <div className="navbar-item" id="profile">
            <a className="navbar-item" href="/profile">
              <p className="mr-3">
                <strong></strong>
              </p>

              <figure className="image">
                <img
                  className="is-rounded"
                  src="https://placeimg.com/80/80/people"
                />
              </figure>
            </a>
          </div>
          <div className="navbar-item" id="controlpanel">
            <a className="navbar-item" href="/controlpanel">
              <span className="icon is-medium">
                <IconContext.Provider
                  value={{ size: "1.2rem", className: "react-icons" }}
                >
                  <div>
                    <FaCog />
                  </div>
                </IconContext.Provider>
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
    </div>
  );
};
export default NavbarComponent;
