import styles from "Styles/YesNo.module.scss"
import { Component } from "react"
import classNames from "classnames"
import CheckIcon from "../../public/check.svg"
import XIcon from "../../public/ttt-x.svg"

interface YesNoProps {
  onYes?: () => void
  onNo?: () => void
}

export default class YesNo extends Component<YesNoProps> {
  render() {
    return (
      <div className={styles.main}>
        <div
          className={classNames(styles.button, styles.yes)}
          onClick={this.props.onYes}
        >
          <CheckIcon className={styles.icon} />
        </div>
        <div
          className={classNames(styles.button, styles.no)}
          onClick={this.props.onNo}
        >
          <XIcon className={styles.icon} />
        </div>
      </div>
    )
  }
}
