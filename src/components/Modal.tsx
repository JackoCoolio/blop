import styles from "Styles/Modal.module.scss"
import { Component, ReactNode } from "react"
import classNames from "classnames"
import { BlopColor } from "src/global"

interface Props {
  allowHide?: boolean
  hidden?: boolean
  color: BlopColor
}

interface State {
  requestHide: boolean
}

export class Modal extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      requestHide: false,
    }
  }

  render(): ReactNode {
    return (
      <div
        className={classNames(styles.modalBackground, {
          [styles.hidden]:
            (this.props.hidden ?? false) || this.state.requestHide,
        })}
        onClick={() => {
          if (this.props.allowHide ?? false) {
            this.setState({
              requestHide: true,
            })
          }
        }}
      >
        <div className={classNames(styles.modal, styles[this.props.color])}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
