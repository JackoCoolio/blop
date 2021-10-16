import styles from "Styles/Search.module.scss"
import classNames from "classnames"
import { Component } from "react"
import { Input, InputProps } from "./Input"
import { setInterval } from "timers"

export interface SearchResult {
  displayText: string
  onSelect?: () => void
}

interface SearchProps {
  color: InputProps["color"]
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  search: (query: string) => Promise<SearchResult[]>
  searchInterval: number
  id?: string
  disabled?: boolean
  className?: string
}

interface SearchState {
  results: SearchResult[]
  query: string
  lastQuery: string
}

export class Search extends Component<SearchProps, SearchState> {
  timer: NodeJS.Timer

  constructor(props: SearchProps) {
    super(props)

    this.timer = setInterval(async () => {
      const query = this.state.query
      if (query === this.state.lastQuery || query === "") return

      const results = await this.props.search(query)
      console.log({
        results,
      })
      this.setState({
        results,
        lastQuery: query,
      })
    }, this.props.searchInterval)

    this.state = {
      results: [],
      query: "",
      lastQuery: "",
    }

    this.generateSearchResultList = this.generateSearchResultList.bind(this)
  }

  generateSearchResultList(): JSX.Element[] {
    const list: JSX.Element[] = []

    for (let i = 0; i < this.state.results.length; i++) {
      list.push(
        <li key={i} className={styles.result}>
          <span className={styles.resultText}>
            {this.state.results[i].displayText}
          </span>
        </li>
      )
    }

    return list
  }

  render() {
    const resultList = this.generateSearchResultList()

    return (
      <div className={classNames(this.props.className, styles.main)}>
        <Input
          color={this.props.color}
          className={styles.searchInput}
          onKeyUp={e => {
            this.setState({
              query: e.currentTarget.value,
            })
          }}
        />
        <div className={styles.resultListHead}>
          <ul className={styles.resultList}>{resultList}</ul>
        </div>
      </div>
    )
  }
}
