import styles from "Styles/ProfileSetupPage.module.scss"
import { Component } from "react"

class ProfileSetupPage extends Component {
  render() {
    return (
      <div id={styles.main}>
        <div id={styles.formContainer}>
          <div id={styles.form}>
            <h1>Account Setup</h1>
            <div id={styles.username}>
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
              ></input>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ProfileSetupPage
