import Link from "next/link";
import { FaBars, FaRegBell } from "react-icons/fa";
import "bulma/css/bulma.min.css";
import {
  Navbar,
  Container,
  Section,
  Image,
  Button,
  Icon,
} from "react-bulma-components";
import { FaCog } from "react-icons/fa";

const NavbarComponent = (args: any) => {
  return (
    <Navbar>
      <Navbar.Container align="left">
        <Navbar.Brand>
          <Navbar.Item href="/">
            <div className="">
              <Image src="../assets/camagru_logo.svg" alt="Main page" />
            </div>
          </Navbar.Item>
          <Navbar.Burger data-target="navbar-burger-button">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </Navbar.Burger>
        </Navbar.Brand>
        <Navbar.Item href="/camera">Take picture</Navbar.Item>
        <Navbar.Item href="/newpost">New post</Navbar.Item>
      </Navbar.Container>
      <Navbar.Container align="right">
        <Navbar.Menu>
          <Navbar.Item>
            <Button.Group>
              <Button>Logout</Button>
              <Button>Sign up</Button>
              <Button>Login</Button>
            </Button.Group>
          </Navbar.Item>
          <Navbar.Menu
            className="navbar-menu is-hidden mobile-menu"
            id="navbar-mobile"
          >
            <Navbar.Item href="/camera">Take picture</Navbar.Item>
            <Navbar.Item href="/newpost">New post</Navbar.Item>
            <Navbar.Item href="/profile">Profile</Navbar.Item>
            <Navbar.Item href="/controlpanel">Control panel</Navbar.Item>
            <Navbar.Item href="/logout">Logout</Navbar.Item>
            <Navbar.Item href="/signup">Sign up</Navbar.Item>
            <Navbar.Item href="/login">Login</Navbar.Item>
          </Navbar.Menu>
          <Navbar.Item>
            <Navbar.Item href="/profile">
              <p className="mr-3">
                <strong></strong>
              </p>

              <figure className="image">
                <Image
                  className="is-rounded"
                  src="https://placeimg.com/80/80/people"
                  alt="Profile"
                />
              </figure>
            </Navbar.Item>
          </Navbar.Item>
          <Navbar.Item href="/controlpanel">
            <FaCog />
          </Navbar.Item>
        </Navbar.Menu>
      </Navbar.Container>
    </Navbar>
  );
};
export default NavbarComponent;
