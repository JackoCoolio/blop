import styles from "Styles/Button.module.scss"
import { Component, MouseEventHandler } from "react"
import classNames from "classnames"

interface ButtonProps {
  id?: string
  color: "blue" | "red" | "green" | "yellow"
  onClick: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: string
}

/**
 * A blop-styled button element.
 */
export class Button extends Component<ButtonProps> {
  render() {
    const { disabled = false } = this.props
    return (
      <button
        id={this.props.id}
        className={classNames([
          styles[this.props.color],
          styles.button,
          disabled ? styles.disabled : "",
          this.props.className,
        ])}
        onClick={disabled ? () => {} : this.props.onClick}
      >
        {this.props.children}
      </button>
    )
  }
}
