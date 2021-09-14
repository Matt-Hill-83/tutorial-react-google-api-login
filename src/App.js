import "./App.css"
import { useEffect, useState } from "react"
import { loadGoogleScript } from "./lib/GoogleLogin"
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID

function App() {
  const [gapi, setGapi] = useState()
  const [googleAuth, setGoogleAuth] = useState()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [imageUrl, setImageUrl] = useState()

  const onSuccess = (googleUser) => {
    setIsLoggedIn(true)
    const profile = googleUser.getBasicProfile()
    setName(profile.getName())
    setEmail(profile.getEmail())
    setImageUrl(profile.getImageUrl())
  }

  const onFailure = () => {
    setIsLoggedIn(false)
  }

  const logOut = () => {
    ;(async () => {
      await googleAuth.signOut()
      setIsLoggedIn(false)
      renderSigninButton(gapi)
    })()
  }

  const renderSigninButton = (_gapi) => {
    _gapi.signin2.render("google-signin", {
      scope: "profile email",
      width: 240,
      height: 50,
      longtitle: true,
      theme: "dark",
      onsuccess: onSuccess,
      onfailure: onFailure,
    })
  }

  useEffect(() => {
    //window.gapi is available at this point
    window.onGoogleScriptLoad = () => {
      const _gapi = window.gapi
      setGapi(_gapi)

      _gapi.load("auth2", () => {
        ;(async () => {
          const _googleAuth = await _gapi.auth2.init({
            client_id: googleClientId,
          })
          setGoogleAuth(_googleAuth)
          renderSigninButton(_gapi)

          _gapi.load("client:auth2", function () {
            _gapi.auth2.init({ client_id: googleClientId })
          })
        })()
      })
    }

    //ensure everything is set before loading the script
    loadGoogleScript()
  }, [])

  function authenticate() {
    return gapi.auth2
      .getAuthInstance()
      .signIn({ scope: "https://www.googleapis.com/auth/youtube.force-ssl" })
      .then(
        function () {
          console.log("Sign-in successful")
        },
        function (err) {
          console.error("Error signing in", err)
        }
      )
  }
  function loadClient() {
    return gapi.client
      .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(
        function () {
          console.log("GAPI client loaded for API")
        },
        function (err) {
          console.error("Error loading GAPI client for API", err)
        }
      )
  }

  // Make sure the client is loaded and sign-in is complete before calling this method.
  function execute() {
    console.log("execute") // zzz

    console.log("gapi", gapi) // zzz
    return (
      // gapi.youtube.commentThreads
      gapi.client.youtube.commentThreads
        .list({
          part: ["snippet,replies"],
          videoId: "AOnM_Wp7klk",
        })
        .then(
          function (response) {
            // Handle the results here (response.result has the parsed body).
            console.log("Response", response)
          },
          function (err) {
            console.error("Execute error", err)
          }
        )
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {!isLoggedIn && <div id="google-signin"></div>}

        {isLoggedIn && (
          <div>
            <div>{/* <img src={imageUrl} />  */}</div>
            <div>{name}</div>
            <div>{email}</div>
            <button className="btn-primary" onClick={logOut}>
              Log Out
            </button>
          </div>
        )}
        {/* <button> */}
        <button
          onClick={() => {
            authenticate().then(loadClient)
          }}
        >
          authorize and load
        </button>
        {/* <button onClick="execute()">execute</button> */}
        <button onClick={() => execute()}>execute</button>
      </header>
    </div>
  )
}

export default App
