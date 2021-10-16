import styles from "Styles/ProfilePage.module.scss"
import React, { Component } from "react"
import { Button } from "Components/Button"
import fetch from "node-fetch"
import update from "immutability-helper"
import { Input } from "Components/Input"
import { ResponseCode } from "Lib/util"
import CheckIcon from "../../../public/check.svg"
import XIcon from "../../../public/ttt-x.svg"
import { Search, SearchResult } from "Components/Search"
import User from "Models/User"

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
  currentUsername: string | null
}

class ProfilePage extends Component<unknown, ProfilePageState> {
  constructor(props: any) {
    super(props)

    this.state = {
      friends: new Map(),
      usernameInput: React.createRef(),
      valid: false,
      errorMessage: "",
      currentUsername: null,
    }
  }

  async isFormValid(local = true): Promise<boolean> {
    const username = this.state.usernameInput.current?.getValue()
    if (
      !username ||
      username === this.state.currentUsername ||
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

    // get information about myself
    const meInformation = await fetch("/api/user/me", {
      method: "get",
    }).then(x => x.json())

    // update state with that information
    this.setState({
      currentUsername: meInformation.username,
    })

    // make sure we actually get an array back
    if (!Array.isArray(friendsList)) {
      return
    }

    // for each friend that we get back, add it to the list
    friendsList.forEach(async friend => {
      if (!friend.id) return

      // get information about user
      const friendUserInformation = await fetch(
        `/api/user?id=${friend.id}`
      ).then(x => x.json())

      // update state with information
      this.setState(
        update(this.state, {
          friends: {
            [friend.id]: {
              $set: {
                username: friendUserInformation.username,
                since: new Date(friend.since),
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
        info = <span>since {friend.since?.toLocaleDateString()}</span>
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
                defaultValue={this.state.currentUsername || ""}
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
          <Search
            color="yellow"
            className={styles.searchBar}
            search={async query => {
              // const results = [
              //   {
              //     displayText: "abc",
              //     onSelect: () => {},
              //   },
              //   {
              //     displayText: "123",
              //     onSelect: () => {},
              //   },
              //   {
              //     displayText: "wow!",
              //     onSelect: () => {},
              //   },
              // ]

              const searchRequestResult: any = await fetch("/api/search", {
                method: "post",
                body: JSON.stringify({
                  query,
                  limit: 10,
                }),
              }).then(x => x.json())

              const formattedResults: SearchResult[] =
                searchRequestResult.matches.map((result: any) => {
                  return {
                    displayText: result.username,
                    onSelect: async () => {
                      await fetch("/api/friends", {
                        method: "post",
                        body: JSON.stringify({
                          targetId: result.id,
                        }),
                      })
                    },
                  }
                })

              return formattedResults
            }}
            searchInterval={1000}
          />
          <ul id={styles.friendsContainer}>{friendCards}</ul>
        </div>
      </div>
    )
  }
}

export default ProfilePage
