import { useEffect, useLayoutEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { GroupHeader, Congratulations, GuidingButton } from './ChallengeComponents.js';
import SuperPitchIntervalChallenge from './SuperPitchClasses.js';
import { updateVoiceRange } from './UserActions.js';

/**
 * The row with the generate & play buttons as well as the interval and the singing progress
 *
 * @param {function} onGenerateBtnClick The function to call onClick on generate
 * @param {function} onPlayBtnClick The function to call onClick on play
 * @param {{type: string, subtype: string}} interval The interval to display
 * @param {number[]} progress The progress singing the interval right
 * @param {string} pulsatingButton The text of the button that should pulsate to indicate the next action to the user
 * @return {React.ReactElement} The React Element
 */
function SingIntervalRow({ onGenerateBtnClick, onPlayBtnClick, interval, progress, pulsatingButton }) {
    return (
        <>
            <div className='row h-100 w-100'>
                <div className={`col-6 col-md-12 flex-grow-1 list-group p-2 ${onGenerateBtnClick ? '' : 'notYetReady'}`}>
                    {/* <GroupHeader text="New Interval" /> */}
                    <div className="list-group-item h-100"><GuidingButton pulsatingButton={pulsatingButton} outline color='success' onClick={ onGenerateBtnClick } className="w-100 h-100">New Interval</GuidingButton></div>
                {/* </div>
                <div className={`col-6 col-md-12 flex-grow-1 list-group p-2`}> */}
                    {/* <GroupHeader text="Root Note" /> */}
                    <div className={`list-group-item h-100 ${onPlayBtnClick ? '' : 'notYetReady'}`}><GuidingButton pulsatingButton={pulsatingButton} outline color='info' onClick={ onPlayBtnClick } className="w-100 h-100">Play Root</GuidingButton></div>
                </div>
                <div className={`col-6 col-md-12 flex-grow-1 list-group p-2 ${Object.keys(interval).length !== 0 ? '' : 'notYetReady'}`}>
                    <GroupHeader text="Interval" />
                    <div className={`list-group-item h-100 interval-display variableGradientBG ${pulsatingButton === 'progress1' ? 'pulsating' : ''}`} style={{ "--greenPercent": `${progress[0]}%` }}>{interval.type ? interval.type : '\u00A0'}<sup>{interval.type === 1 ? "st" : interval.type === 2 ? "nd" : interval.type === 3 ? "rd" : interval.type === "tritone" ? "" : interval.type ? "th": ""}</sup> {interval.subtype !== 'perf' ? (interval.subtype || '') : ''}</div>
                {/* </div>
                <div className={`col-6 col-md-12 flex-grow-1 list-group p-2 ${Object.keys(interval).length !== 0 ? '' : 'notYetReady'}`}> */}
                    {/* <GroupHeader text="Progress" /> */}
                    <div className={`list-group-item h-100 interval-display variableGradientBG ${pulsatingButton === 'progress2' ? 'pulsating' : ''}`} style={{ "--greenPercent": `${progress[1]}%` }}>
                        {Object.keys(interval).length !== 0 ? (interval.notes[1] > interval.notes[0] ? '↑↑↑ UP' : '↓↓↓ DOWN') : ''}
                    {/* <div className={`progress h-50 ${pulsatingButton === 'progress1' ? 'pulsating' : ''}`}><div className='progress-bar bg-success h-100' style={{ "width": `${progress[0]}%` }}></div></div><div className={`progress h-50 ${pulsatingButton === 'progress2' ? 'pulsating' : ''}`}><div className='progress-bar bg-success h-100' style={{"width": `${progress[1]}%`}}></div></div> */}
                    </div>
                </div>
            </div>
        </>
    )
}

/**
 * The slider to set the pitch detection sensitivity
 *
 * @param {number} currentRMS The current input RMS level
 * @param {function} onSliderInput The function to call onInput
 * @param {function} onSettingsButtonClick The function to call onClick on Settings
 * @param {function} onCloseBtnClick The function to call onClick on Close
 * @return {React.ReactElement} The React Element
 */
function SensitivitySlider({ currentRMS, onSliderInput, onSettingsButtonClick, onCloseBtnClick }) {
    return (
        <div className="col list-group list-group-horizontal p-2">
            <GroupHeader text="Sensitivity" />
            <div className="list-group-item w-100 d-flex">
                <span className="flex-fill"><input type="range" min={-50} max={0} step={1} defaultValue={-40} onInput={onSliderInput} className="form-range variableGradientBG sliderBorderRadius" style={{'--greenPercent': `${Math.max(100 + 2 * Math.round(currentRMS), 0)}%`}} /></span>
            </div>
            <div className='list-group-item'>
                <Button outline color='warning' onClick={onSettingsButtonClick} className="w-100 h-100">Settings</Button>
            </div>
            <div className='list-group-item'>
                <Button color='danger' onClick={onCloseBtnClick} className="w-100 h-100">BACK</Button>
            </div>
        </div>
    )
}

/**
 * The musical keyboard indicating the current pitch
 *
 * @param {number[]} [notesToSing=[]] The upcoming notes that will have to be sung
 * @param {number[]} [sungNotes=[]] The notes already successfully sung
 * @param {number} nowSinging The note currently detected
 * @param {boolean} isReady Wether or not it should be displayed as ready
 * @param {number[]} [rangeToHighlight=[-1,-1]] The optional range of keys to highlight for voice range detection
 * @return {React.ReactElement} The React Element
 */
function PitchIndicator({ notesToSing=[], sungNotes=[], nowSinging, isReady, rangeToHighlight=[-1,-1] }) {

    useEffect(() => {
        //console.log('useEffect called');
        if (document.querySelector('.nextNote')) {
            document.querySelector('.nextNote').scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }, [notesToSing]);

    useEffect(() => {
        if (document.querySelector('.nowSinging')) {
            document.querySelector('.nowSinging').scrollIntoView({
                //behavior: "smooth",
                block: "center"
            });
        }
    }, [rangeToHighlight]);

    const pianoKeys = [];
    for (let i = Math.max(...notesToSing, ...sungNotes, 48) + 24; i > -1; i--) {
        const noteName = SuperPitchIntervalChallenge.notes[i % 12];
        //const altNoteName = SuperPitchIntervalChallenge.noteEnharmonicAlts[noteName];
        pianoKeys.push(
            // TODO: Scroll next note into view!
            <div 
                key={ `pianoroll${i}` } 
                id={ `pianoroll${i}` }
                className={ 
                    `${SuperPitchIntervalChallenge.noteIsWhiteKey[noteName] ? 'white key' : 'black key' } ` +
                    `${ notesToSing.indexOf(i) > -1 ? (notesToSing[0] === i ? 'nextNote' : 'laterNote' ) : '' } ` + 
                    `${ sungNotes.indexOf(i) > -1 ? 'sungNote' : '' } ` +
                    `${ i === nowSinging ? 'nowSinging' : '' } ` + 
                    `${ rangeToHighlight[1] > i && rangeToHighlight[0] < i ? 'highlight' : '' }` 
                }
            >
                {/* <span className="altLabel">{ altNoteName ? altNoteName : '' }</span><span className="label">{ noteName }</span> */}
            </div>
        );
    }

    return (
        <div className={ `list-group p-2 h-100 w-100 ${isReady ? '' : 'notYetReady'}` }>
            <GroupHeader text="Your Pitch" />
            <div className='list-group-item h-100 overflow-auto'><div className='pianoroll'>{ pianoKeys }</div></div>
        </div>
    )

    // const rows = [];
    // for (let i = startNoteToDisplay; i < startNoteToDisplay + 12; i++) {
    //     rows.push(<div className={ `list-group-item h-100 ${ i === nextNoteToSing ? 'nextNote' : i === laterNoteToSing ? 'laterNote' : '' }` } key={i}></div>);
    // }
    // return (
    //     <div className="col list-group p-2">
    //         <GroupHeader text="Your Pitch" />
    //         {rows}
    //     </div>
    // )
}

/**
 * The elements to record the user's voice range, should be called if the range is missing
 *
 * @param {function} onStartBtnClick The function to call onClick on Start
 * @param {function} onResetBtnClick The function to call onClick on Reset
 * @param {function} onSaveBtnClick The function to call onClick on Save
 * @param {string} pulsatingButton The text of the button that should pulsate to indicate the next action to the user
 * @return {React.ReactElement} The React Element
 */
function RecordVoiceRange({ onStartBtnClick, onResetBtnClick, onSaveBtnClick, pulsatingButton }) {
    const [recordVoiceRangeModal, setrecordVoiceRangeModal] = useState(true);
  
    const toggle = () => setrecordVoiceRangeModal(!recordVoiceRangeModal);
  
    return (
        <>
            <Modal isOpen={recordVoiceRangeModal} backdrop="static" toggle={toggle}>
                <ModalHeader close={<></>}>Record Range</ModalHeader>
                <ModalBody>
                    You have not recorded your voice range yet.<br />
                    Please record it now. After clicking on Start, please sing your lowest and highest notes. <br />
                    You can start in a comfortable range and then work your way up and down. When you have finished singing, please click the Stop Button.<br />
                    If the shown range doesn't seem right, you can start again with the Start Button.<br />
                    Finally, please save your range with the Save Button.
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggle}>
                        OK
                    </Button>
                </ModalFooter>
            </Modal>
            <div className='h-100 w-100'>
                <div className={`h-100 w-100 list-group list-group-horizontal list-group-vertical-md p-2 ${onStartBtnClick || onResetBtnClick ? '' : 'notYetReady'}`}>
                    <GroupHeader text="Record" />
                    <div className="list-group-item flex-fill"><GuidingButton pulsatingButton={pulsatingButton} outline color='success' onClick={onStartBtnClick} className='w-100 h-100'>Start</GuidingButton></div>
                    <div className="list-group-item flex-fill"><GuidingButton pulsatingButton={pulsatingButton} outline color='primary' onClick={onSaveBtnClick} disabled={!onSaveBtnClick} className="w-100 h-100">Save</GuidingButton></div>
                    <div className="list-group-item flex-fill"><GuidingButton pulsatingButton={pulsatingButton} outline color='danger' onClick={onResetBtnClick} disabled={!onResetBtnClick} className='w-100 h-100'>Reset</GuidingButton></div>
                </div>
            </div>
        </>
    );
}

/**
 * The main Sing Challenge function that puts together all the needed elements
 *
 * @param {SuperPitchIntervalChallenge} challenge The Challenge Object
 * @param {function} setChallengeFn The function to call to update the Challenge Object
 * @param {function} closeActiveChallengeFn The function to call to get back to the main screen
 * @param {{isLoggedIn: boolean, username: string, voiceRangeIsSet: boolean, voiceRange: number[], possibleIntervalsInSemitones: number[]}} userData The user data
 * @param {function} setUserDataFn The function to call to set the user data
 * @param {string} pulsatingButton The text of the button that should pulsate to indicate the next action to the user
 * @param {function} setPulsatingButtonFn The function to call to set the pulsating button string
 * @param {function} showLoadingScreenFn The function to call to show the loading screen
 * @param {function} setSuccessMessageFn The function to call the success message on to show it
 * @param {function} setErrorMessageFn The function to call the error message on to show it
 * @param {function} showSettingsScreenFn The function to call to show the Settings screen
 * @return {React.ReactElement} The React Element
 */
function SingChallenge({ challenge, setChallengeFn, closeActiveChallengeFn, userData, setUserDataFn, pulsatingButton, setPulsatingButtonFn, showLoadingScreenFn, setSuccessMessageFn, setErrorMessageFn, showSettingsScreenFn }) {
    // const [audioContext, setAudioContext] = useState(false);
    //const [challenge, setChallenge] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [detected, setDetected] = useState(false);
    const [progressSingingRight, setProgressSingingRight] = useState([0, 0]);
    const [sungNotes, setSungNotes] = useState([]);
    // const [voiceRangeMissing, setVoiceRangeMissing] = useState(true);
    // const [voiceRange, setVoiceRange] = useState([-1, -1]);
    const [isDetectingVoiceRange, setIsDetectingVoiceRange] = useState(false);
    const [showCongratulations, setShowCongratulations] = useState(false);

    useLayoutEffect(() => {
        if (isDetecting) {
            let timerID;
            const updateLogic = (timestamp, oldTimestamp, nextNote, progress) => {
                const newDetected = challenge.pitchDetector.detectFromCurrentBuffer();
                setDetected(newDetected);
                if (timestamp && oldTimestamp && (challenge.singInterval.notes.length > nextNote)) {
                    // TODO: See if it works also with detected.noteIndex isntead of newDetected
                    if (!challenge.isPlaying && (newDetected.noteIndex === challenge.singInterval.notes[nextNote])) {
                        if (progress[nextNote] >= 100) {
                            nextNote += 1;
                            setChallengeFn(challenge => {
                                challenge.singInterval.nextNote = nextNote;
                                return challenge;
                            });
                            setSungNotes(oldSungNotes => [...oldSungNotes, challenge.singInterval.notes[nextNote-1]]);
                            setPulsatingButtonFn('progress2');
                            if (challenge.singInterval.notes.length === nextNote) {
                                setIsDetecting(false);
                                setShowCongratulations(true);
                                setPulsatingButtonFn('New Interval');
                                return;
                            }
                        } else {
                            progress = progress.map((v, i) => {
                                if (i === nextNote) {
                                    // require 1 Second of singing right, dont go over 100
                                    return Math.min(v + (timestamp - oldTimestamp) / 10, 100);
                                } else {
                                    return v;
                                }
                            });
                            setProgressSingingRight(progress);
                            // const newProgress = progressSingingRight;
                            // // require 1 Second of singing right
                            // newProgress[challenge.singInterval.nextNote] += (newTimestamp - oldTimestamp) / 10;
                            // if (newProgress[challenge.singInterval.nextNote] > 100) newProgress[challenge.singInterval.nextNote] = 100;
                            // setProgressSingingRight(newProgress);
                        }
                    } else {
                        // slowly regress
                        if (progress[nextNote] > 0) {
                            progress = progress.map((v, i) => {
                                if (i === challenge.singInterval.nextNote) {
                                    return Math.max(v - (timestamp - oldTimestamp) / 30, 0);
                                } else {
                                    return v;
                                }
                            });
                            setProgressSingingRight(progress);
                            // const newProgress = progressSingingRight;
                            // newProgress[challenge.singInterval.nextNote] -= (newTimestamp - oldTimestamp) / 30;
                            // if (newProgress[challenge.singInterval.nextNote] < 0) newProgress[challenge.singInterval.nextNote] = 0;
                            // setProgressSingingRight(newProgress);
                        }
                    }
                }
                timerID = requestAnimationFrame((newTimestamp) => { updateLogic(newTimestamp, timestamp, nextNote, progress) });
            }
            timerID = requestAnimationFrame((newTimestamp) => { updateLogic(newTimestamp, newTimestamp, challenge.singInterval.nextNote, progressSingingRight) });

            return () => cancelAnimationFrame(timerID);
        }
    }, [isDetecting]);

    return (
        <>                        
            <div className='grid-left-or-top'>
                {(challenge && !userData.voiceRangeIsSet) ?
                        <RecordVoiceRange 
                            onStartBtnClick = { challenge && !isDetectingVoiceRange ? () => {
                                setUserDataFn({
                                    ...userData,
                                    voiceRange: [null, null]
                                    });
                                setIsDetectingVoiceRange(true);
                                challenge.startSingingVoiceRange((detected, lowestNoteIndex, highestNoteIndex) => {
                                    setDetected(detected);
                                    setUserDataFn({
                                        ...userData,
                                        voiceRange: [lowestNoteIndex, highestNoteIndex]
                                    });
                                });
                                setPulsatingButtonFn('Save');
                            } : null }
                            onResetBtnClick = { challenge && isDetectingVoiceRange ? () => {
                                challenge.stopSingingVoiceRange();
                                setIsDetectingVoiceRange(false);
                                setUserDataFn({
                                    ...userData,
                                    voiceRange: [null, null]
                                    });
                                setPulsatingButtonFn('Start');
                            } : null }
                            onSaveBtnClick = { challenge && isDetectingVoiceRange && (userData.voiceRange[0] !== userData.voiceRange[1]) ? () => {
                                challenge.stopSingingVoiceRange();
                                setIsDetectingVoiceRange(false);
                                setUserDataFn({
                                    ...userData,
                                    voiceRangeIsSet: true
                                });
                                [challenge.minNoteIndex, challenge.maxNoteIndex] = userData.voiceRange;
                                setPulsatingButtonFn('New Interval');
                                if (userData.isLoggedIn) {
                                    const range = userData.voiceRange;
                                    console.log(range);
                                    updateVoiceRange(showLoadingScreenFn, setErrorMessageFn, setSuccessMessageFn, range);
                                }
                            } : null }
                            pulsatingButton={pulsatingButton}
                        />
                    :
                        <SingIntervalRow 
                            onGenerateBtnClick={ challenge ? () => {
                                setIsDetecting(false);
                                setProgressSingingRight([0, 0]);
                                setSungNotes([]);
                                challenge.createInterval({
                                    challengeType: "sing",
                                    possibleIntervalsInSemitones: userData.possibleIntervalsInSemitones
                                });
                                setChallengeFn(challenge);
                                setIsDetecting(true);
                                setPulsatingButtonFn('Play Root');
                            } : null } 
                            onPlayBtnClick={ challenge.singInterval ? () => {
                                challenge.playListenIntervalOrFirstSingNote();
                                setPulsatingButtonFn('progress1');
                                } : null } 
                            interval={ challenge.singInterval || {} }
                            progress = { progressSingingRight }
                            pulsatingButton={pulsatingButton}
                        />
                    }
            </div>
            <div className='grid-right-or-bottom'>
                <PitchIndicator
                    notesToSing={challenge.singInterval ? challenge.singInterval.notes.slice(challenge.singInterval.nextNote) : []}
                    sungNotes={sungNotes}
                    nowSinging={detected.noteIndex}
                    isReady={challenge !== false}
                    rangeToHighlight={userData.voiceRangeIsSet ? [-1, -1] : userData.voiceRange}
                />
            </div>
            <div className="grid-footer">
                <SensitivitySlider 
                    currentRMS = { detected.rms || -50 } 
                    onSliderInput = { challenge ? (ev) => { 
                        challenge.setRMSThreshdB(ev.target.value);
                        } : null }
                    onSettingsButtonClick = { showSettingsScreenFn }
                    onCloseBtnClick={ () => {
                        if (isDetectingVoiceRange) {
                            challenge.stopSingingVoiceRange();
                            setIsDetectingVoiceRange(false);
                        }
                        closeActiveChallengeFn();
                    } }
                />
            </div>
            <Congratulations show = { showCongratulations } functionToHide={setShowCongratulations} />
        </>
    )
}

export default SingChallenge;