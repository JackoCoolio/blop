import fetch from "node-fetch"

export interface FriendData {
  id: string
  username: string
  since: Date | null
}

/**
 * Gets the signed-in user's friends list and optionally sorts it.
 *
 * @param sort whether or not to put friend requests at the start of the list
 * @returns an array of FriendData
 */
export async function getFriendsList(sort: boolean): Promise<FriendData[]> {
  // fetch friends list from API
  const friendResponse = await fetch("/api/friends", {
    method: "get",
  }).then(x => x.json())

  // make sure we get an array back
  if (!Array.isArray(friendResponse)) {
    throw new Error("Something went wrong while trying to fetch friends list!")
  }

  // format the response
  const data: any[] = []
  for (const friend of friendResponse) {
    data.push({
      id: friend.id,
      // `since` might be null
      since: friend.since ? new Date(friend.since) : null,
    })
  }

  // fetch data about each user
  const userDataPromises = []
  for (const friend of data) {
    userDataPromises.push(
      fetch(`/api/user?id=${friend.id}`, {
        method: "get",
      })
        .then(x => x.json())
        .then(user => {
          friend.username = user.username
        })
    )
  }

  // wait for all data to be returned
  await Promise.all(userDataPromises)

  // if we were told to sort the array, sort it
  if (sort)
    // this mutates the array
    data.sort((a, b) => {
      if (a.since === null) {
        return -1
      } else if (b.since === null) {
        return 1
      } else {
        return 0
      }
    })

  return data
}
