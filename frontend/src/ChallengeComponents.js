import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

/**
 * A group heading
 *
 * @export
 * @param {string} text The text to display
 * @return {React.ReactElement} The React Element
 */
export function GroupHeader({ text }) {
    return (
        <div className="list-group-item list-group-item-secondary group-header">{text}</div>
    )
}

// function StatusBar({ statusText='Starting...' }) {
//     return (
//         <div className="col list-group list-group-horizontal p-2">
//             <GroupHeader text="Status" />
//             <div className="list-group-item list-group-item-light w-100">{ statusText }</div>
//         </div>
//     )
// }

/**
 * A button that can be set to a "pulsating" class if the button text matches the pulsatingButton text
 *
 * @export
 * @param {string} className List of CSS class names
 * @param {string} pulsatingButton The text of the button that should pulsate to indicate the next action to the user
 * @param {string} children The button text
 * @param {object} props The other props
 * @return {React.ReactElement} The React Element
 */
export function GuidingButton({ className, pulsatingButton, children, ...props }) {
    return <Button className={`${className} ${pulsatingButton === children ? 'pulsating' : ''}`} {...props}>{children}</Button>;
}

/**
 * Modal to start the audio, deprecated
 *
 * @export
 * @param {function} onBtnClick The function to call onClick the Start button
 * @return {React.ReactElement} The React Element
 */
export function AudioStarter({ onBtnClick }) {
    const [startAudioModal, setStartAudioModal] = useState(true);

    const toggle = () => setStartAudioModal(!startAudioModal);

    return (
        <Modal isOpen={startAudioModal} backdrop="static" toggle={toggle}>
            <ModalHeader close={<></>}>Start Audio</ModalHeader>
            <ModalBody>
                Audio is not running yet, please start to continue.<br />
                Microphone input is needed for singing intervals.
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={onBtnClick}>
                    Start Audio
                </Button>
            </ModalFooter>
        </Modal>
    );
}

/**
 * The Congratulations screen
 *
 * @export
 * @param {boolean} show Whether or not to show the screen
 * @param {function} functionToHide The function to call to hide the screen
 * @return {React.ReactElement} The React Element
 */
export function Congratulations({ show, functionToHide }) {
    const [className, setClassName] = useState('');

    useEffect(() => {
        if (show) {
            setClassName('show');
            setTimeout(() => {
                setClassName('hide');
                setTimeout(() => {
                    setClassName('');
                }, 500);
                functionToHide(false);
            }, 1000);
        }
    }, [show, functionToHide]);


    return (
        <div className={`feedback congratulations ${className}`}><div className='position-absolute top-50 start-50 translate-middle'>Well done!</div></div>
    )
}

/**
 * The Wrong Answer screen
 *
 * @export
 * @param {boolean} show Whether or not to show the screen
 * @param {function} functionToHide The function to call to hide the screen
 * @return {React.ReactElement} The React Element
 */
export function Wronganswer({ show, functionToHide }) {
    const [className, setClassName] = useState('');

    useEffect(() => {
        if (show) {
            setClassName('show');
            setTimeout(() => {
                setClassName('hide');
                setTimeout(() => {
                    setClassName('');
                }, 500);
                functionToHide(false);
            }, 1000);
        }
    }, [show, functionToHide]);


    return (
        <div className={`feedback wrong-answer ${className}`}><div className='position-absolute top-50 start-50 translate-middle'>No</div></div>
    )
}