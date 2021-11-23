import styles from "Styles/Button.module.scss"
import { Component, MouseEventHandler, CSSProperties } from "react"
import classNames from "classnames"
import Link from "next/link"
import { Url } from "url"

interface ButtonProps {
  id?: string
  color: "blue" | "red" | "green" | "yellow"
  onClick?: MouseEventHandler<HTMLButtonElement>
  href?: string | Url
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * A blop-styled button element.
 */
export class Button extends Component<ButtonProps> {
  render() {
    const { disabled = false } = this.props

    const button = (
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

    return (
      <div style={this.props.style}>
        {this.props.href ? (
          <Link href={this.props.href} passHref>
            <a>{button}</a>
          </Link>
        ) : (
          button
        )}
      </div>
    )
  }
}
