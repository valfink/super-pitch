import { Input, Button, Form, Row, Modal } from "reactstrap";
import { API_URL } from "./constants";

/**
 * The form to either register or to log in
 *
 * @export
 * @param {string} action What to do - login or register
 * @param {function} backHomeFn The function to call to get back to the home screen
 * @param {function} showLoadingScreenFn The function to call to show the loading screen
 * @param {function} setErrorMessageFn The function to call to show an error message
 * @param {function} setSuccessMessageFn The function to call to show a success message
 * @param {function} logInUserFn The function to call to log in the user
 * @return {React.ReactElement} The React Element
 */
export function RegisterOrLoginForm({action, backHomeFn, showLoadingScreenFn, setErrorMessageFn, setSuccessMessageFn, logInUserFn}) {

    let formText, buttonText, successMsg;

    if (action === 'login') {
        formText = <><h1>Log In</h1> After logging in, you can use your recorded voice range right away.</>;
        buttonText = 'Login';
        successMsg = 'Successfully logged in!';
    } else {
        formText = <><h1>Register for Super Pitch</h1>After registration you will be able to save your lowest and highest notes so you don't have to sing across your register everytime before starting the Sing Challenge!</>;
        buttonText = 'Register';
        successMsg = 'Successfully registered';
    }

    /**
     * AJAX send the credentials to the server to log in or register
     *
     * @param {Event} event The form submit event - needs to be prevented
     */
    async function sendUserCredentials(event) {
        event.preventDefault();
        showLoadingScreenFn(true);
        // TODO: this needs to be re-enabled for deployment. must be on the same server though, otherwise it wont work
        // if (getCookie('csrftoken') === null) {
        //     await fetch(`${API_URL}/get_csrf_cookie`, { credentials: 'include' });
        // }
        fetch(`${API_URL}/${action}`, {
            method: 'POST',
            // TODO: Include CSRF for deployment
            // headers: { 'X-CSRFToken': getCookie('csrftoken') },
            // mode: 'same-origin',
            body: JSON.stringify({
                email: document.querySelector('#email').value,
                password: document.querySelector('#password').value
            })
        })
            .then(response => response.json())
            .then(result => {
                showLoadingScreenFn(false);
                // error handling
                if (result["error"]) {
                    console.log('Error within result');
                    setErrorMessageFn(result["error"]);
                    return;
                } else {
                    setSuccessMessageFn(successMsg);
                    logInUserFn(result);
                    backHomeFn();
                }
            })
            .catch((err) => {
                console.log('Error caught in promise');
                setErrorMessageFn(err.message);
                showLoadingScreenFn(false);
            });
    }

    /**
     * Gets the specified cookie value
     *
     * @param {string} name The name of the cookie
     * @return {string} The content of the cookie
     */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    return (
        <>
        <Row>
        {formText}
        <Form onSubmit={sendUserCredentials}>
            <Input type="email" required id="email" placeholder="email address" className="my-3" autoFocus />
            <Input type="password" required id="password" placeholder="********" className="my-3" />
            <Button type="submit" color="primary" className="mx-3">{buttonText}</Button><Button onClick={backHomeFn} color="danger"className="mx-3">Cancel</Button>
        </Form>
        </Row>
        </>
    )
}

/**
 * AJAX sends the new voice range to the server
 *
 * @export
 * @param {function} showLoadingScreenFn The function to call to show the loading screen
 * @param {function} setErrorMessageFn The function to call to show an error message
 * @param {function} setSuccessMessageFn The function to call to show a success message
 * @param {number[]} newVoiceRange The new voice range
 */
export function UpdateVoiceRange({ showLoadingScreenFn, setErrorMessageFn, setSuccessMessageFn }, newVoiceRange) {
    console.log('Sending voice range to server...');
    console.log({
        voiceRange: newVoiceRange
    });
    showLoadingScreenFn(true);
    // TODO: this needs to be re-enabled for deployment. must be on the same server though, otherwise it wont work
    // if (getCookie('csrftoken') === null) {
    //     await fetch(`${API_URL}/get_csrf_cookie`, { credentials: 'include' });
    // }
    fetch(`${API_URL}/voiceRange`, {
        method: 'PUT',
        // TODO: Include CSRF for deployment
        // headers: { 'X-CSRFToken': getCookie('csrftoken') },
        // mode: 'same-origin',
        body: JSON.stringify({
            voiceRange: newVoiceRange
        })
    })
        .then(response => response.json())
        .then(result => {
            showLoadingScreenFn(false);
            // error handling
            if (result["error"]) {
                console.log('Error within result');
                setErrorMessageFn(result["error"]);
                return;
            } else {
                setSuccessMessageFn('Voice Range saved to server successfully!');
            }
        })
        .catch((err) => {
            console.log('Error caught in promise');
            setErrorMessageFn(err.message);
            showLoadingScreenFn(false);
        });
}