import { useState } from 'react';
import { Button } from 'reactstrap';
import { GroupHeader,  Congratulations, Wronganswer, GuidingButton } from './ChallengeComponents.js';
import SuperPitchIntervalChallenge from './SuperPitchClasses.js';

/**
 * The row with the generate and play buttons
 *
 * @param {function} onGenerateBtnClick The function to call onClick on the Generate button
 * @param {function} onPlayBtnClick The function to call onClick on the Play button
 * @param {string} pulsatingButton The text of the button that should pulsate to indicate the next action to the user
 * @return {React.ReactElement} The React Element
 */
function ListenIntervalRow({ onGenerateBtnClick, onPlayBtnClick, pulsatingButton }) {
    return (
        <>
            <div className={`col-6 list-group list-group-horizontal-sm flex-fill p-2 ${onGenerateBtnClick ? '' : 'notYetReady'}`}>
                {/* <GroupHeader text="Interval" /> */}
                <div className="list-group-item flex-fill"><GuidingButton pulsatingButton={pulsatingButton} onClick={onGenerateBtnClick} outline color="success" className="w-100 h-100">New Interval</GuidingButton></div>
                <div className="list-group-item flex-fill"><GuidingButton pulsatingButton={pulsatingButton} onClick={onPlayBtnClick} outline color='info' disabled={!onPlayBtnClick} className="w-100 h-100">Play</GuidingButton></div>
            </div>
        </>
    )
}

/**
 * The row with all the possible answer buttons
 *
 * @param {function} onAnswerBtnClick The function to call onClick one of the buttons
 * @return {React.ReactElement} The React Element
 */
function AnswerButtonsRow({ userData, onAnswerBtnClick }) {
    return (
        <div className={`col-12 list-group flex-fill d-flex p-2 ${onAnswerBtnClick ? '' : 'notYetReady'}`}>
            <GroupHeader text="What was that?" />
            {SuperPitchIntervalChallenge.intervalsWithInfos.map((sameType) => 
                <div className='list-group-item flex-fill d-flex'>
                    { sameType.map((value) =>
                        <Button 
                            outline 
                            color='primary' 
                            onClick={onAnswerBtnClick} 
                            className="m-1 flex-fill" 
                            disabled={userData.possibleIntervalsInSemitones.indexOf(value.inSemitones) === -1}
                            data-interval-type={value.type} 
                            data-interval-subtype={value.subtype}>
                                {value.displayText}
                        </Button>
                    ) }
                </div>
            ) }
            {/* <div className="list-group-item flex-fill d-flex">
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='2' data-interval-subtype='min'>Minor second</Button>
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='2' data-interval-subtype='maj'>Major second</Button>
            </div>
            <div className="list-group-item flex-fill d-flex">
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='3' data-interval-subtype='min'>Minor third</Button>
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='3' data-interval-subtype='maj'>Major third</Button>
            </div>
            <div className="list-group-item flex-fill d-flex">
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='4' data-interval-subtype='perf'>Fourth</Button>
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='tritone' data-interval-subtype='perf'>Tritone</Button>
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='5' data-interval-subtype='perf'>Fifth</Button>
            </div>
            <div className="list-group-item flex-fill d-flex">
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='6' data-interval-subtype='min'>Minor sixth</Button>
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='6' data-interval-subtype='maj'>Major sixth</Button>
            </div>
            <div className="list-group-item flex-fill d-flex">
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='7' data-interval-subtype='min'>Minor seventh</Button>
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='7' data-interval-subtype='maj'>Major seventh</Button>
            </div>
            <div className="list-group-item flex-fill d-flex">
                <Button outline color='primary' onClick={onAnswerBtnClick} className="m-1 flex-fill" data-interval-type='8' data-interval-subtype='perf'>Octave</Button>
            </div> */}
        </div>
    )
}

/**
 * The row with the Settings and Close buttons
 *
 * @param {function} onSettingsButtonClick The function to call onClick on the Settings button
 * @param {function} onCloseBtnClick The function to call onClick on the Close button
 * @return {React.ReactElement} The React Element
 */
function SettingsRow({ onSettingsButtonClick, onCloseBtnClick }) {
    return (
        <div className="col list-group list-group-horizontal p-2">
            <div className='list-group-item w-100'>
                <Button outline color='warning' onClick={onSettingsButtonClick} className="w-100 h-100">Settings</Button>
            </div>
            <div className='list-group-item'>
                <Button color='danger' onClick={onCloseBtnClick} className="w-100 h-100">BACK</Button>
            </div>
        </div>
    )
}

/**
 * The main Listen Challenge function that puts together all the needed elements
 *
 * @param {SuperPitchIntervalChallenge} challenge The Challenge Object
 * @param {function} setChallengeFn The function to call to update the Challenge Object
 * @param {function} closeActiveChallengeFn The function to call to get back to the main screen
 * @param {{isLoggedIn: boolean, username: string, voiceRangeIsSet: boolean, voiceRange: number[], possibleIntervalsInSemitones: number[]}} userData The user data
 * @param {string} pulsatingButton The text of the button that should pulsate to indicate the next action to the user
 * @param {function} setPulsatingButtonFn The function to call to set the pulsating button string
 * @param {function} showSettingsScreenFn The function to call to show the Settings screen
 * @return {React.ReactElement} The React Element
 */
function ListenChallenge({ challenge, setChallengeFn, closeActiveChallengeFn, userData, pulsatingButton, setPulsatingButtonFn, showSettingsScreenFn }) {
    const [listIntervalReady, setListenIntervalReady] = useState(false);
    const [intervalHasPlayed, setIntervalHasPlayed] = useState(false);
    const [showCongratulations, setShowCongratulations] = useState(false);
    const [showWronganswer, setShowWronganswer] = useState(false);
    return (
        <>
            <div className='row'><ListenIntervalRow 
                onGenerateBtnClick={ challenge ? () => {
                    const newChallenge = challenge;
                    newChallenge.createInterval({
                        challengeType: "listen",
                        possibleIntervalsInSemitones: userData.possibleIntervalsInSemitones
                    });
                    setChallengeFn(newChallenge);
                    setListenIntervalReady(true);
                    setIntervalHasPlayed(false);
                    setPulsatingButtonFn('Play');
                } : null }
                onPlayBtnClick={listIntervalReady ? () => {
                    challenge.playListenIntervalOrFirstSingNote();
                    setIntervalHasPlayed(true);
                    setPulsatingButtonFn(null);
                } : null }
                pulsatingButton={pulsatingButton}
            /></div>
            <div className='row growing-row-overflow-hidden d-flex'><AnswerButtonsRow 
                userData={ userData }
                onAnswerBtnClick={ intervalHasPlayed ? (event) => {
                    if (challenge.checkListenIntervalAnswer(event.target.dataset.intervalType, event.target.dataset.intervalSubtype)) {
                        setShowCongratulations(true);
                        setIntervalHasPlayed(false);
                        setPulsatingButtonFn('New Interval');
                    } else {
                        setShowWronganswer(true);
                    }
                } : null }
            /></div>
            <div className='row'><SettingsRow onSettingsButtonClick={showSettingsScreenFn} onCloseBtnClick={closeActiveChallengeFn} /></div>
            <Congratulations show={showCongratulations} functionToHide={setShowCongratulations} />
            <Wronganswer show={showWronganswer} functionToHide={setShowWronganswer} />
        </>
    )
}

export default ListenChallenge;