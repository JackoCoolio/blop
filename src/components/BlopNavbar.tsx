import styles from "Styles/BlopNavbar.module.scss"
import Link from "next/link"
import { Component } from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import fetch from 'node-fetch'
import { PersonCircle, ArrowRightShort } from "react-bootstrap-icons"

console.log(styles)

interface NavbarState {
  loggedIn: boolean
}

export class BlopNavbar extends Component<unknown, NavbarState> {

  constructor(props: any) {
    super(props)

    this.state = {
      loggedIn: false
    }
  }

  async componentDidMount() {
    try {
      const res = await fetch('/api/session', {
        method: "get",
      })

      const json = await res.json()

      this.setState({
        loggedIn: json.loggedIn
      })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { loggedIn } = this.state

    let loginButton
    if (loggedIn) {
      loginButton = <Link href="/dashboard" passHref>
        <Nav.Link><PersonCircle /></Nav.Link>
      </Link>
    } else {
      loginButton = <Link href="/login" passHref>
        <Nav.Link>Login <ArrowRightShort height="100%" alignmentBaseline="middle" className={styles.icon} /></Nav.Link>
      </Link>
    }

    return (
      <Navbar className={styles.navbar}>
        <Container>
          <Link href="/" passHref>
            <Navbar.Brand className={styles.button}>Blop</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav"></Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link href="/" passHref>
                <Nav.Link className={styles.button}>Home</Nav.Link>
              </Link>
              <Link href="/dashboard" passHref>
                <Nav.Link className={styles.button} >Dashboard</Nav.Link>
              </Link>
            </Nav>
            <Nav className="ms-auto">
              {loginButton}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
  }
}
