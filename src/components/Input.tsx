import styles from "Styles/Input.module.scss"
import React, { Component } from "react"
import classNames from "classnames"

interface InputProps {
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  defaultValue?: string
  color: "blue" | "red" | "green" | "yellow"
  id?: string
  disabled?: boolean
  className?: string
}

interface InputState {
  inputElement: React.RefObject<HTMLInputElement>
}

/**
 * A blop-styled input element.
 */
export class Input extends Component<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props)

    this.state = {
      inputElement: React.createRef(),
    }
  }

  render(): JSX.Element {
    const { disabled = false } = this.props
    return (
      <input
        className={classNames([
          styles[this.props.color],
          styles.input,
          disabled ? styles.disabled : "",
          this.props.className,
        ])}
        ref={this.state.inputElement}
        onKeyPress={this.props.onKeyPress}
        onKeyUp={this.props.onKeyUp}
        onKeyDown={this.props.onKeyDown}
        defaultValue={this.props.defaultValue}
        id={this.props.id}
        disabled={this.props.disabled}
      />
    )
  }

  /**
   * Returns the current value of the underlying input element.
   * @returns a string
   */
  getValue(): string {
    if (typeof this.state.inputElement.current?.value === "string")
      return this.state.inputElement.current.value

    return this.props.defaultValue || ""
  }
}
