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
  promptText?: string
}

interface SearchState {
  results: SearchResult[]
  query: string
  lastQuery: string
  showResults: boolean
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
      showResults: false,
    }

    this.generateSearchResultList = this.generateSearchResultList.bind(this)
  }

  generateSearchResultList(): JSX.Element[] {
    const list: JSX.Element[] = []

    for (let i = 0; i < this.state.results.length; i++) {
      list.push(
        <li
          key={i}
          className={styles.result}
          onMouseDown={this.state.results[i].onSelect}
        >
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
      <div
        className={classNames(this.props.className, styles.main)}
        id={this.props.id}
      >
        <Input
          color={this.props.color}
          className={styles.searchInput}
          promptText={this.props.promptText}
          onFocus={() =>
            this.setState({
              showResults: true,
            })
          }
          onBlur={() =>
            this.setState({
              showResults: false,
            })
          }
          onKeyUp={e => {
            if (e.currentTarget.value === "") {
              this.setState({
                results: [],
              })
            }

            this.setState({
              query: e.currentTarget.value,
            })
          }}
          textAlign="center"
        />
        <div
          className={styles.resultListHead}
          style={{
            opacity: this.state.showResults ? "100%" : "0%",
            pointerEvents: this.state.showResults ? "initial" : "none",
          }}
        >
          <ul className={styles.resultList}>{resultList}</ul>
        </div>
      </div>
    )
  }
}
