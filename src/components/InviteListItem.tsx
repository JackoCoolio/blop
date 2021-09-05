import styles from "Styles/InviteCard.module.scss"
import { Component } from "react"
import XSvg from "../../public/ttt-x.svg"

type InviteListItemOnDelete = (name: string) => void

interface InviteListItemProps {
  name: string
  onDelete?: InviteListItemOnDelete
}

export class InviteListItem extends Component<InviteListItemProps, unknown> {
  constructor(props: InviteListItemProps) {
    super(props)
  }

  render() {
    return (
      <div className={styles.main}>
        <span className={styles.name}>{this.props.name}</span>
        <XSvg
          className={styles.x}
          onClick={() => {
            if (this.props.onDelete) this.props.onDelete(this.props.name)
          }}
        ></XSvg>
      </div>
    )
  }
}
