import { useState } from "react"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from "reactstrap"
import SuperPitchIntervalChallenge from "./SuperPitchClasses";

/**
 * Display a Loading Modal
 *
 * @export
 * @return {React.ReactElement} The React Element
 */
export function LoadingScreen() {
    return (
        <div className={`feedback loading show`}><Spinner animation="border" role="status" className="position-absolute top-50 start-50">
            <span className="visually-hidden">Loading...</span>
        </Spinner></div>
    )
}

/**
 * Display an Error Modal
 *
 * @export
 * @param {string} message The message to display
 * @param {function} closeFn The function to call to close the modal
 * @return {React.ReactElement} The React Element
 */
export function ErrorScreen({message, closeFn}) {
    const [isOpen, setIsOpen] = useState(true);

    const toggle = () => {
        setIsOpen(!isOpen);
        setTimeout(() => {
            closeFn();
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} backdrop="static" toggle={toggle}>
            <ModalHeader className="text-danger">ERROR</ModalHeader>
            <ModalBody>
                {message || 'Sorry, this didn\'t work :('}
            </ModalBody>
            <ModalFooter>
                <Button color="danger" onClick={toggle}>
                    OK
                </Button>
            </ModalFooter>
        </Modal>
    )
}

/**
 * Display a Success Modal
 *
 * @export
 * @param {string} message The message to display
 * @param {function} closeFn The function to call to close the modal
 * @return {React.ReactElement} The React Element
 */
export function SuccessScreen({message, closeFn}) {
    const [isOpen, setIsOpen] = useState(true);

    const toggle = () => {
        setIsOpen(!isOpen);
        setTimeout(() => {
            closeFn();
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} backdrop="static" toggle={toggle}>
            <ModalHeader className="text-success">SUCCESS</ModalHeader>
            <ModalBody>
                {message || 'This worked out! :)'}
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={toggle}>
                    OK
                </Button>
            </ModalFooter>
        </Modal>
    )
}

/**
 * The Settings Modal
 *
 * @export
 * @param {{isLoggedIn: boolean, username: string, voiceRangeIsSet: boolean, voiceRange: number[], possibleIntervalsInSemitones: number[]}} userData The user data
 * @param {function} setUserDataFn The function to call to set the user data
 * @param {function} closeFn The function to call to close the modal
 * @return {React.ReactElement} The React Element
 */
export function SettingsScreen({ userData, setUserDataFn, closeFn }) {
    const [isOpen, setIsOpen] = useState(true);

    const toggle = () => {
        setIsOpen(!isOpen);
        setTimeout(() => {
            closeFn();
        }, 500);
    };

    /**
     * Change the list of possible intervals to include or exclude the specified interval
     *
     * @param {number} interval The interval in semitones
     */
    function togglePossibleInterval(interval) {
        const newPossibleIntervals = userData.possibleIntervalsInSemitones;
        const index = newPossibleIntervals.indexOf(interval);
        if (index > -1) {
            newPossibleIntervals.splice(index, 1);
        } else {
            newPossibleIntervals.splice(interval-1, 0, interval);
        }
        setUserDataFn({
            ...userData,
            possibleIntervalsInSemitones: newPossibleIntervals,
        })
    }

    return (
        <Modal isOpen={isOpen} backdrop="static" toggle={toggle}>
            <ModalHeader>Settings</ModalHeader>
            <ModalBody>
                Select the Intervals that you want in the Challenge:<br />
                {SuperPitchIntervalChallenge.intervalsWithInfos.map((sameType) =>
                    <div className='flex-fill d-flex'>
                        {sameType.map((value) =>
                            <Button 
                                outline={userData.possibleIntervalsInSemitones.indexOf(value.inSemitones) === -1}
                                color='primary' 
                                onClick={() => { togglePossibleInterval(value.inSemitones) }} 
                                className="m-1 flex-fill" 
                                data-interval-in-semitones={value.inSemitones}
                                key={`interval_insemitones_${value.inSemitones}`}>
                                    {value.displayText}
                            </Button>
                        )}
                    </div>
                )}
                {userData.voiceRangeIsSet ? 
                    <><br />To reset your voice range click here: 
                    <div className='flex-fill d-flex'>
                        <Button 
                            color="danger" 
                            className="flex-fill" 
                            onClick={ () => {
                                setUserDataFn({
                                    ...userData,
                                    voiceRangeIsSet: false,
                                    voiceRange: [null, null]
                                });
                                toggle();
                            } }>Reset Voice Range
                        </Button></div></> 
                    : null
                }
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={toggle}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    )
}