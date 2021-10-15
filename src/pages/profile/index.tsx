import styles from "Styles/ProfilePage.module.scss"
import React, { Component } from "react"
import { Button } from "Components/Button"
import fetch from "node-fetch"
import update from "immutability-helper"
import { Input } from "Components/Input"
import { ResponseCode } from "Lib/util"
import CheckIcon from "../../../public/check.svg"
import XIcon from "../../../public/ttt-x.svg"

const bannedUsernameCharactersRegex = /[^A-Za-z0-9\-_]/

interface FriendData {
  username: string | null
  since: Date | null
  isRequest: boolean
}

interface ProfilePageState {
  friends: Map<string, FriendData>
  usernameInput: React.RefObject<Input>
  valid: boolean
  errorMessage: string
}

class ProfilePage extends Component<unknown, ProfilePageState> {
  constructor(props: any) {
    super(props)

    this.state = {
      friends: new Map(),
      usernameInput: React.createRef(),
      valid: false,
      errorMessage: "",
    }
  }

  async isFormValid(local = true): Promise<boolean> {
    const username = this.state.usernameInput.current?.getValue()
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

      if (response.matches.length > 0) {
        return false
      }
    }

    return true
  }

  async componentDidMount() {
    const friendsList = await fetch("/api/friends", {
      method: "get",
    }).then(x => x.json())

    // make sure we actually get an array back
    if (!Array.isArray(friendsList)) {
      return
    }

    // for each friend that we get back, add it to the list
    friendsList.forEach(friend => {
      this.setState(
        update(this.state, {
          friends: {
            [friend.id]: {
              $set: {
                username: "work in progress",
                since: friend.since,
                isRequest: friend.since === null,
              },
            },
          },
        })
      )
    })
  }

  async submitProfileSettings() {
    const valid = await this.isFormValid(false)

    if (valid) {
      const username = this.state.usernameInput.current!.getValue()

      const response = await fetch("/api/user/me", {
        method: "PATCH",
        body: JSON.stringify({
          username,
        }),
      })

      if (response.status !== ResponseCode.NO_CONTENT) {
        console.log(response)
        const { error } = await response.json()

        if (error) {
          this.setState({
            errorMessage: error,
          })
        }
      }
    } else {
      this.setState({
        errorMessage: "There was an error submitting!",
      })
    }
  }

  render() {
    const friendCards: any = []
    let iter = 0
    this.state.friends.forEach(friend => {
      console.log(friend)
      let info
      if (friend.isRequest) {
        info = (
          <div className={styles.friendOptions}>
            <div className={styles.friendButton} id={styles.accept}>
              <CheckIcon className={styles.icon} />
            </div>
            <div className={styles.friendButton} id={styles.decline}>
              <XIcon className={styles.icon} />
            </div>
          </div>
        )
      } else {
        info = <span>{friend.since?.toISOString()}</span>
      }
      friendCards.push(
        <li key={iter++} className={styles.friendCard}>
          <h1 className={styles.friendName}>{friend.username}</h1>
          {info}
        </li>
      )
    })

    return (
      <div id={styles.main}>
        <div id={styles.profilePane}>
          <div id={styles.profileContainer}>
            <h1 id={styles.profileHeading}>Profile</h1>
            <div className={styles.profileField}>
              <h2>Username:</h2>
              <Input
                ref={this.state.usernameInput}
                color="blue"
                defaultValue="username"
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
                className={styles.profileField}
              />
            </div>
            <Button
              color="green"
              disabled={!this.state.valid}
              onClick={this.submitProfileSettings.bind(this)}
            >
              Confirm
            </Button>
            <span className={styles.profileField}>
              {this.state.errorMessage}
            </span>
          </div>
        </div>
        <div id={styles.friendsPane}>
          <ul id={styles.friendsContainer}>{friendCards}</ul>
        </div>
      </div>
    )
  }
}

export default ProfilePage
