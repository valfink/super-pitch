
# Welcome to SuperPitch!

I created this web App as capstone project for Harvard's Course _CS50 Web Programming with Python and JavaScript._

# Distinctiveness and Complexity

## About SuperPitch

SuperPitch is a **front-end-heavy ear training App**. You can use it to improve your ability to recognize musical intervals by **listening** to them, but more importantly also your ability to **sing** them!  
Obviously the layout is responsive and scales well on large and small screens.

## Front-End

### Functionality

The front-end is a React App using functional components and relying heavily on the `SuperPitchClasses.js` file.  
The React App handles all the user interaction, renders output to the user and also communicates with the back-end, while the `SuperPitchClasses.js` file handles all the musical and audio i/o logic through three classes:
* `SuperPitchIntervalChallenge` is the main "mother" class and directly handles interval creation and checks the answer for a _Listen Challenge_. It contains instances of the other two classes.
* `SuperPitchSoundNode` generates click free sound output through customised `OscillatorNode` methods, using 2 Oscillators
* `SuperPitchDetectorNode` handles the real time pitch detection. The detection works with auto-correlation. The implementation of the auto-correlation function is heavily inspired by Chris Wilson's [PitchDetect](https://github.com/cwilso/PitchDetect) repo.

### User Interface

On the starting screen, a user can start a _Listen Challenge_ or a _Sing Challenge_ or they can also log in / out or register.

On the _Listen Challenge_ screen, the user can generate a random musical interval and play it back as often as they would like. They can then click on a button to choose the interval they thought they heard.  
A green or red screen will tell them if their answer was correct. If wrong, they can try again.

On the _Sing Challenge_ screen, the user can generate a random musical interval and play the root note of it. They will then need to sing the root note until the first progress bar gets full. After that, they will need to sing the indicated interval on that note, until the second progress bar gets full.  
A green screen will congratulate them to their successful singing.

In both _Listen Challenge_ and _Sing Challenge_, the user can access a _Settings_ Modal. There they can choose to only generate certain types of intervals and also to reset their voice range in order to re-record it.

### Voice Range

When you want to sing an interval, it is important that all the notes are within your voice range. That is why any user will be asked to record their voice range before starting to sing intervals, so the App will only present notes that are singable to the user, avoiding frustration and allowing them to concentrate on the interval instead of their voice.  
If the user is logged in, the voice range automatically gets saved in their account on the back-end, so the next time they start the App, they don't have to record their range again.

## Back-End

The back-end is a Django Server that works as a minimalistic API endpoint, providing the possibility to:
* register
* log in
* log out
* save the user's voice range

The server works with one model `User` which contains, aside from the `username` and `password`, the two fields `voiceRangeMinNote` and `voiceRangeMaxNote`. These can get updated from the front-end, complying with CSRF protection.

_Note_: A possible future addition to server-side functionality is a high score through which the user can view their singing performance progress, but also compare their best score ranking with other users' scores.

# How to run SuperPitch

Before running the App, make sure you have installed `Django`, the `pip` package `django-cors-headers`, as well as `npm` for the front-end.

Inside the respository there are two folders, `frontend` and `sp-backend`. You will need two terminal windows to run the App.  
With one terminal window, navigate into the `sp-backend` directory. There you can start the Django server:
```bash
python manage.py runserver
```  
With the other window, navigate into the `frontend` directory. There, you can start the App with:
```bash
HTTPS=true npm start
```
The App will open in your browser automatically.  
**Attention**: The `HTTPS=true` is fundamental for the App to work! It requests the microphone input from the browser for the singing functionality. Some browsers will never grant that if not connected through HTTPS. So the React Development Server needs to be started with the HTTPS option. In the browser you can ignore the warning about an unsafe certificate.

I deliberately didn't submit a built version of the App so the JavaScript code remains easy to read and understand. That's the reason two servers are needed to start the App.

# What's in the files

## Front-end
* `src/constants/index.js`: The API URL, saved as a central constant so it can be changed easily
* `src/App.js`: The general App logic. Here are stored the states for the user data and the challenge Object (among others). It also opens the different screens for the challenges or the log-in form
* `src/AppModals.js`: Provides four Modal Screens that are called throughout the App:
  * `LoadingScreen` indicates waiting for the server to respond
  * `ErrorScreen` presents an error message
  * `SuccessScreen` presents a success message
  * `SettingsScreen` allows to change the challenge settings, choosing only certain intervals to listen or sing and also to reset the recorded voice range
* `src/AppStarter.js`: Provides the start screen where the user is able to start a challenge, register, or log in / out
* `src/ChallengeComponents.js`: Provides the following Components that are used in different places throughout the App:
  * `GroupHeader` provides a header item for a list group
  * `GuidingButton` is a customised `Button` element from `ReactStrap` that gets the possibility to add to itself a `pulsating` class in order to indicate to the user where to click next
  * `Congratulations` shows a "congratulations" screen, is called after a right answer / good singing
  * `Wronganswer` shows a "wrong answer" screen, is called after a wrong answer
* `src/index.js`: Creates the React Root Element
* `src/ListenChallenge.js`: Displays everything in context of a _Listen Challenge_ where the user has to recognize random intervals by listening to them. Defines the following Components only used for the _Listen Challenge_:
  * `ListenIntervalRow` displays the "New Intervall" and "Play" buttons
  * `AnswerButtonsRow` displays the answer buttons with all the possible intervals. If the user chooses to enable only selected intervals in the settings, the other answer buttons will be disabled
  * `SettingsRow` displays the lower row with the "Settings" and "Back" buttons
  * `ListenChallenge` is the file's main Component, puts together the other Components and provides the UI logic for the _Listen Challenge_
* `src/SingChallenge.js`: Displays everything in context of a _Sing Challenge_ where the user has to sing intervals that are randomly generated. Defines the following Components only used for the _Sing Challenge_:
  * `SingIntervalRow` displays the "Generate" and "Play" buttons, but also the generated interval and indicates the user's progress singing the interval
  * `SensitivitySlider` displays a slider that is used to control the pitch detection sensitivity. The slider also shows the live RMS input level so that the user can intuitively select the right level. It also displays the "Settings" and "Back" buttons
  * `PitchIndicator` displays a piano roll that is used to show to the user the real time pitch of the note they are currently singing, also highlights the notes of the interval so that the user intuitively sees if they are singing too high or too low. When recording the voice range, the whole range will be highlighted instead of only single notes
  * `RecordVoiceRange` displays information and handles functionality to record the user's voice range, which needs to be done before starting the actual challenge in case the voice range is not set
  * `SingChallenge` is the file's main Component, puts together the other Components and provides the UI logic for the _Sing Challenge_
* `src/style.css`: Stylesheet containing all the additional custom styles that are not native Bootstrap style
* `src/SuperPitchClasses.js`: The central file handling all the internal challenge logic and also sound i/o and pitch detection. Defines the following Classes:
  * `SuperPitchIntervalChallenge` is the main Class and also instantiates Objects of the other two classes. This class creates the interval either for singing or listening and also provides a pitch detector and the possibility to play the interval. All contained methods are documented within the file.
  * `SuperPitchSoundNode` is used to play notes to the user. The sound gets played and also stopped click free and at a reasonable volume. All contained methods are documented within the file.
  * `SuperPitchDetectorNode` is used to live detect the pitch of the audio input from the user's microphone. It provides different methods to either detect only once from the current audio buffer, leaving the handling of constant detection to the calling function – or it can continuously detect until told to stop the detection. All contained methods are documented within the file.
* `src/UserActions.js`: Provides the following Component and functions associated with the user account and the server:
  * `RegisterOrLoginForm` displays a form that is used either to register a new user or to log in and also sends the user credentials to the server
  * `updateVoiceRange` sends the updated voice range to the server so it gets saved in the user account
  * `getCookie` gets a cookie value and is used for Django's CSRF protection

## Back-end
* `sp_backend/settings.py`: Sets the installed Django Apps, including `corsheaders`. For development I added `CORS_ALLOW_ALL_ORIGINS = True` at the end of the file to avoid CORS problems due to the two servers needed for development.
* `sp_backend/settings.py`: The URL configuration for the server, points mainly to `sp_user_backend.urls`.
* `sp_user_backend/admin.py`: The Admin configuration, the `User` model is registered here.
* `sp_user_backend/models.py`: The definition of the `User` model.
* `sp_user_backend/urls.py`: The URL configuration for the API, defining the following URLS:
  * `get_csrf_cookie` is used to retrieve a CSRF protection cookie, if there is none already present
  * `register` is used to register a new user 
  * `login` is used to log in an existing user
  * `logout` is used to log out an existing user
  * `voiceRange` is used to send the logged in user's updated voice range to the server and save it
* `sp_user_backend/views.py`: The back-end views that handle user account actions:
  * `get_csrf_cookie` returns an empty "ok" response and the desired CSRF protection cookie
  * `login_view` logs the user in and returns the user data in JSON
  * `logout_view` logs the user out
  * `register` creates a new user, logs them in and returns the user data in JSON
  * `voiceRange_view` updates the user's saved voice range and returns the user data in JSON