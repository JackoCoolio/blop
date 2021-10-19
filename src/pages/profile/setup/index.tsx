import styles from "Styles/ProfileSetupPage.module.scss"
import React, { Component } from "react"
import { Button } from "Components/Button"
import { parseCookies } from "nookies"
import { getSessionInformation } from "src/pages/api/session"
import { isSuccessfulResponse } from "Lib/response"
import fetch from "node-fetch"
import { ResponseCode } from "Lib/util"
import { Router, withRouter } from "next/router"
import PartialUser from "Models/PartialUser"

const bannedUsernameCharactersRegex = /[^A-Za-z0-9\-_]/

interface ProfileSetupPageState {
  usernameInput: React.RefObject<HTMLInputElement>
  errorMessage: string
  valid: boolean
}

interface ProfileSetupPageProps {
  router: Router
}

class ProfileSetupPage extends Component<
  ProfileSetupPageProps,
  ProfileSetupPageState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      usernameInput: React.createRef(),
      errorMessage: "",
      valid: false,
    }
  }

  async isFormValid(local = true): Promise<boolean> {
    const username = this.state.usernameInput.current?.value
    if (
      !username ||
      username.length < 4 ||
      username.length > 16 ||
      bannedUsernameCharactersRegex.test(username)
    ) {
      return false
    }

    if (!local) {
      const response = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({
          username,
        }),
      }).then(x => x.json())

      console.log(response)

      if (response.matches.length > 0) {
        return false
      }
    }

    return true
  }

  async submitProfileSettings() {
    const valid = await this.isFormValid(false)

    if (valid) {
      const username = this.state.usernameInput.current!.value

      const response = await fetch("/api/user/me", {
        method: "PATCH",
        body: JSON.stringify({
          username,
        }),
      })

      if (response.status !== ResponseCode.NO_CONTENT) {
        const { message } = await response.json()

        if (message) {
          this.setState({
            errorMessage: message,
          })
        }
      } else {
        this.props.router.push("/create")
      }
    } else {
      this.setState({
        errorMessage: "There was an error submitting!",
      })
    }
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
                ref={this.state.usernameInput}
                onKeyPress={e => {
                  const value = e.currentTarget.value

                  // make sure username length is <= 16
                  if (e.currentTarget.value.length >= 16) {
                    e.currentTarget.value = value.substring(0, 16)
                    e.preventDefault()
                  }

                  if (bannedUsernameCharactersRegex.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                onKeyUp={async () => {
                  this.setState({
                    valid: await this.isFormValid(),
                  })
                }}
              />
            </div>
            <div className={styles.section} id={styles.submit}>
              <Button
                id={styles.submitButton}
                color="blue"
                disabled={!this.state.valid}
                onClick={this.submitProfileSettings.bind(this)}
              >
                Submit
              </Button>
            </div>
            <span>{this.state.errorMessage}</span>
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
    const partialUserDoc = await PartialUser.findById(sessionInfo.body.userId)

    if (!partialUserDoc) {
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

export default withRouter(ProfileSetupPage)
