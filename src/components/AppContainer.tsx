import styles from "Styles/AppContainer.module.scss"
import { Component, CSSProperties } from "react"

interface AppContainerProps {
  className?: string
  style?: CSSProperties
  hidden?: boolean
}

class AppContainer extends Component<AppContainerProps> {
  render() {
    return (
      <div
        style={this.props.style}
        className={this.props.className}
        id={styles.appContainer}
        hidden={this.props.hidden}
      >
        {this.props.children}
      </div>
    )
  }
}

export default AppContainer
