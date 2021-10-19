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
  shouldSearch: boolean
  selectedResult: number | null
}

export class Search extends Component<SearchProps, SearchState> {
  timer: NodeJS.Timer

  constructor(props: SearchProps) {
    super(props)

    this.timer = setInterval(async () => {
      const query = this.state.query
      if (
        !this.state.shouldSearch ||
        query === this.state.lastQuery ||
        query === ""
      )
        return

      this.setState({
        lastQuery: query,
        shouldSearch: false,
        results: await this.props.search(query),
      })
    }, this.props.searchInterval)

    this.state = {
      results: [],
      query: "",
      lastQuery: "",
      showResults: false,
      shouldSearch: false,
      selectedResult: null,
    }

    this.generateSearchResultList = this.generateSearchResultList.bind(this)
  }

  generateSearchResultList(): JSX.Element[] {
    const list: JSX.Element[] = []

    for (let i = 0; i < this.state.results.length; i++) {
      list.push(
        <li
          key={i}
          className={classNames(styles.result, {
            [styles.selected]: this.state.selectedResult === i,
          })}
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
          onChange={e => {
            if (e.currentTarget.value === "") {
              this.setState({
                results: [],
                selectedResult: null,
              })
            }

            this.setState({
              query: e.currentTarget.value,
              shouldSearch: true,
            })
          }}
          onKeyDown={e => {
            if (this.state.results.length === 0) return
            if (e.key === "ArrowUp") {
              const resultIndex =
                ((this.state.selectedResult || this.state.results.length) - 1) %
                this.state.results.length
              const result = this.state.results[resultIndex]
              this.setState({
                // some cool math
                selectedResult: resultIndex,
                shouldSearch: false,
              })

              e.currentTarget.value = result.displayText
              e.preventDefault()
            } else if (e.key === "ArrowDown") {
              const resultIndex =
                ((this.state.selectedResult || 0) + 1) %
                this.state.results.length
              const result = this.state.results[resultIndex]
              this.setState({
                // some cool math
                selectedResult: resultIndex,
                shouldSearch: false,
              })

              e.currentTarget.value = result.displayText
              e.preventDefault()
            } else if (e.key === "Enter") {
              if (this.state.selectedResult !== null) {
                const result = this.state.results[this.state.selectedResult]

                if (result.onSelect) result.onSelect()
                this.setState({
                  query: "",
                  shouldSearch: false,
                  showResults: false,
                  results: [],
                  selectedResult: null,
                })

                e.currentTarget.value = ""
                e.preventDefault()
              }
            }
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
