import styles from "Styles/ProfileSetupPage.module.scss"
import { Component } from "react"
import { Button } from "Components/Button"
import { parseCookies } from "nookies"
import { getUserDocFromSession, isSessionLoggedIn } from "Lib/session"
import User from "Models/User"
import { getSessionInformation } from "src/pages/api/session"
import { isSuccessfulResponse } from "Lib/response"

interface State {
  dis: boolean
}

class ProfileSetupPage extends Component<unknown, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      dis: false,
    }
  }

  async submitProfileSettings() {
    console.log("Profile settings updating...")
  }

  render() {
    return (
      <div id={styles.main}>
        <div id={styles.formContainer}>
          <div id={styles.form}>
            <h1>Account Setup</h1>
            <div className={styles.section} id={styles.username}>
              <span id={styles.usernameLabel}>Username </span>
              <input
                id={styles.usernameInput}
                type="text"
                autoFocus
                onKeyPress={e => {
                  const value = e.currentTarget.value

                  // make sure username length is <= 16
                  if (e.currentTarget.value.length >= 16) {
                    e.currentTarget.value = value.substring(0, 16)
                    e.preventDefault()
                  }

                  if (!/[A-Za-z0-9\-_]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
              />
            </div>
            <div className={styles.section} id={styles.submit}>
              <Button
                id={styles.submitButton}
                color="blue"
                disabled={this.state.dis}
                onClick={this.submitProfileSettings.bind(this)}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export async function getServerSideProps({ req }: any) {
  const { session } = parseCookies({ req })
  const sessionInfo = await getSessionInformation(session)

  // if the user isn't logged in, what profile are they going to set up?
  if (!isSuccessfulResponse(sessionInfo) || !sessionInfo.body.loggedIn) {
    // that's right. none. get out.
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    }
  } else {
    // check if the profile is still being set up
    // we know at this point that the user exists
    const userDoc = await User.findById(sessionInfo.body.userId)

    // some odd looking TS syntax
    if (!userDoc!.newUser) {
      return {
        redirect: {
          permanent: false,
          destination: "/profile",
        },
      }
    }

    return {
      props: {},
    }
  }
}

export default ProfileSetupPage
