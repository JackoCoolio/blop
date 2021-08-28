import "Styles/globals.scss"
import { BlopNavbar } from "Components/BlopNavbar"

import type { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
  // this is the body component
  return (
    <>
      <BlopNavbar />
      <Component {...pageProps} />
    </>
  )
}
export default MyApp
