import { useState } from 'react';
import { LoadingScreen, ErrorScreen, SuccessScreen, SettingsScreen } from './AppModals.js';
import SingChallenge from './SingChallenge.js';
import ListenChallenge from './ListenChallenge.js';
import { RegisterOrLoginForm } from './UserActions.js';
import AppStarter from './AppStarter.js';
import SuperPitchIntervalChallenge from "./SuperPitchClasses";
import { API_URL } from './constants/index.js';

/**
 * The general logic of the App
 *
 * @return {React.ReactElement} The React Element

 */
function App() {
  const [activeAction, setActiveAction] = useState(null);
  const [audioContext, setAudioContext] = useState(false);
  const [challenge, setChallenge] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [pulsatingButton, setPulsatingButton] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [userData, setUserData] = useState({
    isLoggedIn: false,
    username: null,
    voiceRangeIsSet: false,
    voiceRange: [null, null],
    possibleIntervalsInSemitones: Array.from(Array(12), (_, index) => index + 1)
  });

  /**
   * Set the user to logged in
   *
   * @param {{username: string, voiceRange: number[]}} data The user data fetched from the server
   */
  function setUserAsLoggedIn(data) {
    setUserData({
      ...userData,
      isLoggedIn: true,
      username: data.username,
      voiceRangeIsSet: data.voiceRange[0] !== data.voiceRange[1],
      voiceRange: data.voiceRange
    });
  }

  /**
   * Log out the user from the server and set them to logged out
   *
   */
  function logOutUser() {
    setShowLoadingScreen(true);
    fetch(`${API_URL}/logout`)
      .then(response => response.json())
      .then(result => {
        setShowLoadingScreen(false);
        // error handling
        if (result["error"]) {
          console.log('Error within result');
          setErrorMessage(result["error"]);
          return;
        } else {
          setUserData({
            ...userData,
            isLoggedIn: false,
            username: null,
            voiceRangeIsSet: false,
            voiceRange: [null, null]
          })
          setSuccessMessage("User successfully logged out.");
        }
      })
      .catch((err) => {
        console.log('Error caught in promise');
        setErrorMessage(err.message);
        setShowLoadingScreen(false);
      });
  }

  /**
   * Iniitiate the Challenge Object
   *
   * @param {boolean} [withMic=false] Whether or not to request microphone permissions which might open a dialog to confirm
   */
  function initChallenge(withMic=false) {
    let theChallenge;
    if (!challenge) {
      let ctx;
      if (!audioContext) {
        const newAudioContext = new AudioContext();
        setAudioContext(newAudioContext);
        ctx = newAudioContext;
      } else {
        ctx = audioContext;
      }
      theChallenge = new SuperPitchIntervalChallenge(ctx);
    } else {
      theChallenge = challenge;
    }
    if (withMic) {
      theChallenge.initSinging()
        .then(() => { 
          setChallenge(theChallenge); 
        })
    }
    setChallenge(theChallenge);
  }

  return (
    <>
    { showLoadingScreen ? <LoadingScreen /> : null }
    { showSettingsScreen ? <SettingsScreen userData={userData} setUserDataFn={setUserData} closeFn={() => {setShowSettingsScreen(false)}} /> : null }
    { errorMessage ? <ErrorScreen message={errorMessage} closeFn={() => {setErrorMessage(null)}} /> : null }
    { successMessage ? <SuccessScreen message={successMessage} closeFn={() => {setSuccessMessage(null)}} /> : null}
    <div className="container-md text-center border h-100">
      { activeAction === 'sing' ?
        <div className='App h-100 grid-container'>
          <SingChallenge 
            challenge={ challenge }
            setChallengeFn={ setChallenge }
            closeActiveChallengeFn={() => { setActiveAction(null) } }
            userData={userData}
            setUserDataFn={setUserData}
            pulsatingButton={pulsatingButton}
            setPulsatingButtonFn={setPulsatingButton}
            showLoadingScreenFn={setShowLoadingScreen}
              setErrorMessageFn={setErrorMessage}
              setSuccessMessageFn={setSuccessMessage}
              showSettingsScreenFn={ () => { setShowSettingsScreen(true); } }
          />
        </div>
        : activeAction === 'listen' ?
          <div className='App h-100 d-flex flex-column'>
            <ListenChallenge 
                challenge={challenge}
                setChallengeFn={setChallenge}
                closeActiveChallengeFn={() => { setActiveAction(null) }}
                userData={userData}
                pulsatingButton={pulsatingButton}
                setPulsatingButtonFn={setPulsatingButton}
                showSettingsScreenFn={ () => { setShowSettingsScreen(true); }}
            />
          </div>
        : activeAction === 'register' || activeAction === 'login' ?
          <RegisterOrLoginForm 
            action={activeAction}
            backHomeFn={() => {setActiveAction(null)}}
            showLoadingScreenFn={setShowLoadingScreen}
            setErrorMessageFn={setErrorMessage}
            setSuccessMessageFn={setSuccessMessage}
            logInUserFn={setUserAsLoggedIn}
          />
        :   <div className='App h-100 d-flex flex-column'>
                <AppStarter 
                  onListenBtnClick={ () => {
                    initChallenge(false);
                    setActiveAction('listen');
                    setPulsatingButton('New Interval');
                  } }
                  onSingBtnClick = { () => {
                    initChallenge(true);
                    setActiveAction('sing');
                    setPulsatingButton(userData.voiceRangeIsSet ? 'New Interval' : 'Start')
                  } }
                  onLoginBtnClick={userData.isLoggedIn ? null : () => {setActiveAction('login')}}
                  onRegisterBtnClick={ userData.isLoggedIn ? null : () => { setActiveAction('register') }}
                  onLogoutBtnClick={ userData.isLoggedIn ? logOutUser : null }
                />
          </div>
      }
    </div>
    </>
  );
}

export default App;
