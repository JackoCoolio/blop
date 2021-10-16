import styles from "Styles/Input.module.scss"
import React, { Component } from "react"
import classNames from "classnames"

export interface InputProps {
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  defaultValue?: string
  color: "blue" | "red" | "green" | "yellow"
  id?: string
  disabled?: boolean
  className?: string
  promptText?: string
  textAlign?: "left" | "right" | "center"
}

interface InputState {
  inputElement: React.RefObject<HTMLInputElement>
  showPrompt: boolean
}

/**
 * A blop-styled input element.
 */
export class Input extends Component<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props)

    this.state = {
      inputElement: React.createRef(),
      showPrompt: !this.props.defaultValue,
    }

    this.getValue = this.getValue.bind(this)
  }

  render(): JSX.Element {
    const { disabled = false } = this.props
    return (
      <div className={styles.inputContainer}>
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
          onChange={this.props.onChange}
          onFocus={e => {
            if (this.props.onFocus) this.props.onFocus(e)
            this.setState({
              showPrompt: false,
            })
          }}
          onBlur={e => {
            if (this.props.onBlur) this.props.onBlur(e)
            this.setState({
              showPrompt: true,
            })
          }}
          defaultValue={this.props.defaultValue}
          id={this.props.id}
          disabled={this.props.disabled}
          style={{
            textAlign: this.props.textAlign || "left",
          }}
        />
        <span
          className={styles.promptText}
          style={{
            filter:
              this.state.showPrompt && this.getValue() === ""
                ? "blur(0px) opacity(100%)"
                : "blur(10px) opacity(0%)",
            textAlign: this.props.textAlign || "left",
          }}
        >
          {this.props.promptText || ""}
        </span>
      </div>
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
