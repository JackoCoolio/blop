import AppContainer from "Components/AppContainer"
import { Component } from "react"

interface ErrorPageProps {
  statusCode: any
}

class ErrorPage extends Component<ErrorPageProps, unknown> {
  render() {
    return (
      <AppContainer style={{ color: "white" }}>
        <h1>Oops!</h1>
        <h2>{this.props.statusCode}</h2>
      </AppContainer>
    )
  }
}

export async function getServerSideProps({ res, err }: any) {
  console.log(res)
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return {
    props: {
      statusCode,
    },
  }
}

export default ErrorPage
