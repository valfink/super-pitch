/**
 * Main Class for audio io and interval handling
 *
 * @export
 * @class SuperPitchIntervalChallenge
 */
export default class SuperPitchIntervalChallenge {
    // static props & methods
    /** Array with all 12 notes, leaving out the "Bb" versions as they are all enharmonic */
    static notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    /** Object with the info for every note of static notes, if it is a white key or not */
    static noteIsWhiteKey = {
        "C": true, 
        "C#": false, 
        "D": true, 
        "D#": false, 
        "E": true, 
        "F": true, 
        "F#": false, 
        "G": true, 
        "G#": false, 
        "A": true, 
        "A#": false, 
        "B": true
    };
    /** Array containing all possible intervals including infos, divided in sub-arrays per interval type */
    static intervalsWithInfos = [
        [
            { type: 2, subtype: 'min', inSemitones: 1, displayText: 'Minor second' },
            { type: 2, subtype: 'maj', inSemitones: 2, displayText: 'Major second' },
        ],
        [
            { type: 3, subtype: 'min', inSemitones: 3, displayText: 'Minor third' },
            { type: 3, subtype: 'maj', inSemitones: 4, displayText: 'Major third' },
        ],
        [
            { type: 4, subtype: 'perf', inSemitones: 5, displayText: 'Fourth' },
            { type: "tritone", subtype: 'perf', inSemitones: 6, displayText: 'Tritone' },
            { type: 5, subtype: 'perf', inSemitones: 7, displayText: 'Fifth' },
        ],
        [
            { type: 6, subtype: 'min', inSemitones: 8, displayText: 'Minor sixth' },
            { type: 6, subtype: 'maj', inSemitones: 9, displayText: 'Major sixth' },
        ],
        [
            { type: 7, subtype: 'min', inSemitones: 10, displayText: 'Minor seventh' },
            { type: 7, subtype: 'maj', inSemitones: 11, displayText: 'Major seventh' },
        ],
        [
            { type: 8, subtype: 'perf', inSemitones: 12, displayText: 'Octave' },
        ],
    ];
    /** 2D Array ordered by semitones, more or less reverse to intervalsWithInfos. [x][0] => interval type, [x][1] => interval subtype */
    static semitonesToInterval = [null, ...SuperPitchIntervalChallenge.intervalsWithInfos.flat()].map(
        (obj) => obj ? [obj.type, obj.subtype] : undefined
    );
    /** Possible types of SuperPitch Challenges */
    static possibleChallengeTypes = ["sing", "listen"];
    /**
     * Identifies a note index based on the frequency of the note in question
     * 
     * @param {number} freq The frequency from which the note index shall be identified
     * @param {number} [a4=440] The value of the "a4", in Hertz
     * @returns {number} The identified note index, without detuning from its core frequency
     */
    static noteIndexFromFrequency(freq, a4=440) {
        return Math.round(12 * (Math.log(freq / a4)/Math.log(2))) + 45;
    }
    /**
     * Identifies the core frequency of a note index
     * 
     * @param {number} noteIndex The note index from which the frequency shall be identified
     * @param {number} [a4=440] The value of the "a4", in Hertz
     * @returns {number} The identified core frequency
     */
    static frequencyFromNoteIndex(noteIndex, a4=440) {
        return a4 * Math.pow(2, (noteIndex - 45) / 12);
    }
    /**
     * Identifies the detuning of a frequency from a note's core frequency
     * 
     * @param {number} freq The input frequency
     * @param {number} noteIndex The note index from whose core frequency the detuning shall be identified
     * @returns {number} The identified detuning, in Cents
     */
    static detuningFromFrequency(freq, noteIndex) {
        return Math.floor(1200 * Math.log(freq / this.frequencyFromNoteIndex(noteIndex)) / Math.log(2));
    }
    /**
     * Returns a "note object" from a note index
     * 
     * @param {number} noteIndex The note index
     * @param {number} [a4=440] The value of the "a4", in Hertz
     * @returns {{octave: number, note: string, freq: number}} A "note" object, containing octave, note name, frequency
     */
    static noteFromNoteIndex(noteIndex, a4=440) {
        return {
            octave: Math.floor(noteIndex / 12) + 1,
            note: this.notes[noteIndex % 12],
            freq: a4 * Math.pow(2,(noteIndex - 45) / 12)
        }
    }
    /**
     * Identifies the note index from its octave and name
     * 
     * @param {number} octave The octave number
     * @param {string} noteName The name of the note
     * @returns {number} The note index
     */
    static noteIndexFromNote(octave, noteName) {
        return 12 * (octave - 1) + this.notes.indexOf(noteName);
    }
    /**
     * Converts a sound amplitude value into a dB (full scale) value
     * 
     * @param {number} amplitude The amplitude as a value between 0 and 1
     * @returns {number} The according dB (full scale)
     */
    static dBFSfromAmplitude(amplitude) {
        return 20*Math.log10(Math.abs(amplitude));
    }

    // public props
    /** The main audio context, must be supplied when calling the constructor */
    audioContext;
    /** The main gain node, will be created within the constructor */
    mainGainNode;
    /** The "a4" in Hertz, by default 440 */
    a4;
    /** The index of the lowest note for an interval */
    minNoteIndex;
    /** The index of the highest note for an interval */
    maxNoteIndex;
    /** used in an old version, will be deleted */
    singNoteRecTimeInMs;
    /** Determines if the object is all ready for singing (i.e. if initSinging() has been called) */
    isReadyForSinging = false;
    /** The to be created interval that has to be sung */
    singInterval = null;
    /** Says if there is a listen interval ready */
    hasListenInterval = false;
    /** Is set to true anytime a sound plays in order to not the pitch of it's own output */
    isPlaying = false;
    /** The duration for how long a single note should be played */
    playDuration = 2;
    /** Is set to true anytime the detector works as it should be called only once at the same time */
    isDetectingVoiceRange = false;
    /** The pitch detector object, gets initialised in the constructor */
    pitchDetector;

    // private props
    /** The listen interval that has to be identified by listening */
    #listenInterval = null;

    /**
     * Creates the new IntervalChallenge Object
     * 
     * @param {AudioContext} audioContext The global audio context
     * @param {object} [options] The options to setup
     * @param {number} [options.a4=440] The "a4" in Hertz
     * @param {number} [options.singNoteRecTimeInMs=1000] Deprecated, will be removed
     * @param {number} [options.minNoteIndex=24] The index of the lowest note for an interval
     * @param {number} [options.maxNoteIndex=71] The index of the highest note for an interval
     */
    constructor(audioContext, options={}) {
        if (!audioContext) console.error('No audioContext provided for interval challenge object!');

        this.audioContext = audioContext;
        this.mainGainNode = new GainNode(audioContext, {
            gain: 0.5,
        });
        this.mainGainNode.connect(audioContext.destination);

        this.a4 = options.a4 || 440;
        this.singNoteRecTimeInMs = options.singNoteRecTimeInMs || 1000;

        this.minNoteIndex = options.minNoteIndex || 24;
        this.maxNoteIndex = options.maxNoteIndex || 71;
        this.pitchDetector = new SuperPitchDetectorNode(audioContext);
    }

    /**
     * Initiates the Pitch Detector in order to get ready for singing
     */
    async initSinging() {
        await this.pitchDetector.init()
        .then(() => {
            this.isReadyForSinging = true;
        })
        .catch((err) => console.error(`${err.name}: ${err.message}`) );
    }

    /**
     * Sets the Pitch Detector's RMS threshold for detection
     * 
     * @param {number} threshold The threshold in dB (full scale)
     */
    setRMSThreshdB( threshold ) {
        console.log(`Set RMS Thresh to: ${threshold}`);
        this.pitchDetector.rmsMinThreshdB = threshold;
    }

    /**
     * Deprecated, can be used to sing the lowest and highest note of the voice range
     * 
     * @param {boolean} lowest Is it the lowest note that is being sung?
     * @param {function} callbackFn The callback function the handles the detecion data
     */
    singLowestOrHighestNote(lowest=true, callbackFn) {
        let start;
        const allDetectedNoteIndices = [];

        this.pitchDetector.startDetecting((detected, timestamp, oldTimestamp) => {
            if (!timestamp) return;

            if (!start) start = timestamp;

            allDetectedNoteIndices.push(detected.noteIndex);

            if (timestamp - start > this.singNoteRecTimeInMs) {
                this.pitchDetector.stopDetecting();
                const detectedNoteIndex = Math.round(SuperPitchDetectorNode.getArrayMeanValue(allDetectedNoteIndices));
                if (lowest) {
                    this.minNoteIndex = detectedNoteIndex;
                } else {
                    this.maxNoteIndex = detectedNoteIndex;
                }
                //console.log(detectedNoteIndex);
                //console.log(SuperPitchIntervalChallenge.noteFromNoteIndex(detectedNoteIndex));
            }
            callbackFn(detected, timestamp);
        });
    }

    /**
     * Allows singing the voice range in order to set lowest and highest note indices accordingly
     * 
     * @param {function} callbackFn The callback function to handle the pitch detection data visually
     */
    startSingingVoiceRange(callbackFn) {
        let start, lowestNoteIndex, highestNoteIndex;

        this.isDetectingVoiceRange = true;

        this.pitchDetector.startDetecting((detected, timestamp, oldTimestamp) => {
            if (!this.isDetectingVoiceRange) {
                this.pitchDetector.stopDetecting();
                return;
            }

            if (!lowestNoteIndex || detected.noteIndex < lowestNoteIndex) lowestNoteIndex = detected.noteIndex;
            if (!highestNoteIndex || detected.noteIndex > highestNoteIndex) highestNoteIndex = detected.noteIndex;

            callbackFn(detected, lowestNoteIndex, highestNoteIndex);
        })
    }

    /**
     * Stops the "sing voice range" mode
     */
    stopSingingVoiceRange() {
        this.isDetectingVoiceRange = false;
    }

    // // do I actually need this?
    // setMinNoteIndex(minOctave=3, minNote="C") {
    //     this.minNoteIndex = SuperPitchIntervalChallenge.noteIndexFromNote(minOctave, minNote);
    // }
    // // do I actually need this?
    // setMaxNoteIndex(maxOctave=6, maxNote="B") {
    //     this.maxNoteIndex = SuperPitchIntervalChallenge.noteIndexFromNote(maxOctave, maxNote);
    // }

    /**
     * Generates a new random interval
     * 
     * @param {object} options The options for interval generation, must at least include the challenge type
     * @param {string} options.challengeType The type of challenge, for now "sing" or "listen"
     * @param {string} [options.direction] The direction of the interval, "random", "up" or "down"
     * @param {number[]} [options.possibleIntervalsInSemitones] An array of the possible interval lengths in semitones
     */
    createInterval(options={}) {
        const challengeType = options.challengeType;
        if (!challengeType || SuperPitchIntervalChallenge.possibleChallengeTypes.indexOf(challengeType) == -1) return console.error("No valid challenge type provided for createInterval!");

        let direction = options.direction || "random";
        if (direction === "random") direction = ["up", "down"][Math.floor(Math.random()*2)];

        // set possible intervals in semitones based on passed options
        const possibleIntervalsInSemitones = options.possibleIntervalsInSemitones || Array.from(Array(12), (_, index) => index + 1);

        // randomly find the interval
        const randomInterval = {};
        randomInterval.notes = [];
        randomInterval.inSemitones = possibleIntervalsInSemitones[Math.floor(possibleIntervalsInSemitones.length * Math.random())];
        randomInterval.type = SuperPitchIntervalChallenge.semitonesToInterval[randomInterval.inSemitones][0];
        randomInterval.subtype = SuperPitchIntervalChallenge.semitonesToInterval[randomInterval.inSemitones][1];
        // randomInterval.type = intervalTypes[Math.floor(intervalTypes.length * Math.random())];
        // const possibleIntervalOptions = Object.keys(all_intervals[randomInterval.type]);
        // randomInterval.subtype = possibleIntervalOptions[Math.floor(possibleIntervalOptions.length * Math.random())];
        // randomInterval.inSemitones = all_intervals[randomInterval.type][randomInterval.subtype];
        //console.log(`Interval is: ${this.#intervalType + this.#intervalSubtype}`);
        
        // randomly find the notes within given boundaries
        const availableNoteIndices = [...Array(this.maxNoteIndex-this.minNoteIndex).keys()].map(i => i + this.minNoteIndex);
        const startNoteIndex = availableNoteIndices[Math.floor(availableNoteIndices.length * Math.random())];
        const stopNoteIndex = startNoteIndex + randomInterval.inSemitones * Math.pow(-1, direction !== "up"); // add or substract based on direction
        randomInterval.notes.push(startNoteIndex);
        randomInterval.notes.push(stopNoteIndex);
        //this.#startNote = SuperPitchIntervalChallenge.noteFromNoteIndex(startNoteIndex);
        //this.#stopNote = startNoteIndex + this.#intervalInSemitones * Math.pow(-1, direction != "up"); // add or substract based on direction
        // check if last note is still in give boundaries, correct notes if necessary
        // TODO: could only be done for singing -> check if it makes sense also for listening!
        if (direction === "up") {
            if (stopNoteIndex > this.maxNoteIndex) {
                randomInterval.notes[1] = this.maxNoteIndex;
                randomInterval.notes[0] = this.maxNoteIndex - randomInterval.inSemitones;
            }
        } else {
            if (stopNoteIndex < this.minNoteIndex) {
                randomInterval.notes[1] = this.minNoteIndex;
                randomInterval.notes[0] = this.minNoteIndex + randomInterval.inSemitones;
            }
        }

        if (challengeType == "sing") {
            //if (!options.callbackFn) return console.error("No callback function specified for handling the detected pitch!");

            this.singInterval = randomInterval;
            this.singInterval.nextNote = 0;
            this.#listenInterval = null;
            this.hasListenInterval = false;
            //this.pitchDetector.startDetecting(options.callbackFn);
        } else {
            this.#listenInterval = randomInterval;
            this.hasListenInterval = true;
            this.singInterval = null;
        }
    }

    /**
     * Will either play the complete "listen challenge" interval, or the first note of the "sing challenge" interval, depending on which is present in the object
     *
     * @param {number} [delayBetween=1] The delay between the two notes
     */
    playListenIntervalOrFirstSingNote(delayBetween=1){
        this.isPlaying = true;
        // play complete "listen interval"
        if (this.#listenInterval) {
            for (let i=0; i<this.#listenInterval.notes.length; i++) {
                this.playFrequency(SuperPitchIntervalChallenge.frequencyFromNoteIndex(this.#listenInterval.notes[i]), this.audioContext.currentTime + i * delayBetween);
            }
            setTimeout(() => {
                this.isPlaying = false;
            }, (this.#listenInterval.notes.length * delayBetween + this.playDuration) * 1000);
        // or play first note of "sing interval"
        } else {
            this.playFrequency(SuperPitchIntervalChallenge.frequencyFromNoteIndex(this.singInterval.notes[0]));
            setTimeout(() => {
                this.isPlaying = false;
            }, this.playDuration * 1000);
        }
    }

    /**
     * Plays the specified frequency
     *
     * @param {number} freq The frequency to play
     * @param {number} [when=null] The time when to play, as it should be passed to the sound node
     */
    playFrequency(freq, when=null) {
        const tone = new SuperPitchSoundNode(this.audioContext, {
            type: 'sine',
            frequency: freq,
        });
        tone.connectInternalNodes(this.mainGainNode);
        tone.startWithFadeIn(when);
        tone.stopAfterFadeOut((when || this.audioContext.currentTime) + this.playDuration);
    }

    /**
     * Checks if the note that the user currently sings is the right for the current sing challenge
     *
     * @return {boolean} Indicates whether the note is right or not
     */
    checkCurrentlySingingNote() {
        if ((this.pitchDetector.detected.noteIndex === this.singInterval.notes[this.singInterval.nextNote]) && !this.isPlaying) {
            // console.log(`RIGHT: ${this.pitchDetector.detected.noteIndex} is ${this.singInterval.notes[this.singInterval.nextNote]}`)
            return true;
        } else {
            // console.log(`Detected: ${this.pitchDetector.detected.noteIndex}`);
            // console.log(`Expected: ${this.singInterval.notes[this.singInterval.nextNote]}`);
            return false;
        }
    }

    /**
     * Checks if the provided answer is correct for the current listen challenge
     *
     * @param {string} intervalType The answered intervalType
     * @param {string} intervalSubtype The answered intervalSubtype
     * @return {boolean} Indicates whether the answer is correct
     */
    checkListenIntervalAnswer(intervalType, intervalSubtype) {
        if (this.#listenInterval.type == intervalType && this.#listenInterval.subtype == intervalSubtype) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Tells the Pitch Detector to stop pitch detection
     *
     */
    stopDetecting() {
        this.pitchDetector.stopDetecting();
    }
}



/**
 * The Class that produces sounds, Object will be created from SuperPitchIntervalChallenge
 *
 * @class SuperPitchSoundNode
 * @extends {OscillatorNode}
 */
class SuperPitchSoundNode extends OscillatorNode {

    // TODO: nicer sounds

    /**
     * Creates an instance of SuperPitchSoundNode that can play a single sound.
     * @param {AudioContext} context The global audio context
     * @param {object} options The options for sound output
     * @param {number} [options.fadeInTime] The fade in time for the sound
     * @param {number} [options.fadeOutTime] The fade out time for the sound
     * @param {number} options.frequency The frequency of the sound
     */
    constructor(context, options={}) {
        super(context, options);
        this.fadeInTime = options.fadeInTime || 0.01;
        this.fadeOutTime = options.fadeOutTime || 1;
        this.gainNode = new GainNode(context, {
            gain: 0,
        });
        this.modNode = new OscillatorNode(context, {
            type: "sawtooth",
            frequency: options.frequency,
            detune: 5,
        });
        this.modGainNode = new GainNode(context, {
            gain: 0.1,
        });
    }

    /**
     * Connects the internal nodes
     *
     * @param {AudioContext} context The global audio context
     */
    connectInternalNodes(context) {
        this.modNode.connect(this.modGainNode);
        this.modGainNode.connect(this.gainNode);
        this.connect(this.gainNode);
        this.gainNode.connect(context);
    }

    /**
     * Starts playing the sound with a fade in
     *
     * @param {number} [when=null] The time when to play as interpreted by SoundNode
     */
    startWithFadeIn(when = null) {
        this.start(when);
        this.modNode.start(when);
        //this.gainNode.gain.exponentialRampToValueAtTime(1, this.context.currentTime + this.fadeInTime);
        this.gainNode.gain.setTargetAtTime(1, when || this.context.currentTime, this.fadeInTime);
    }

    /**
     * Stops playing the sound after a fade out
     *
     * @param {number} [when=null] The time when to stop as interpreted by SoundNode
     */
    stopAfterFadeOut(when = null) {
        // Stops the tone after fadeout that starts at "when"
        setTimeout(() => {
            this.gainNode.gain.exponentialRampToValueAtTime(0.00000001, this.context.currentTime + this.fadeOutTime);
        }, (when - this.fadeOutTime - this.context.currentTime) * 1000);
        //this.gainNode.gain.setTargetAtTime(0.1, when ? (when - this.fadeOutTime) : this.context.currentTime, this.fadeOutTime);
        this.stop((when || this.context.currentTime));
        this.modNode.stop((when || this.context.currentTime));
    }
}



/**
 * The Class that handles pitch detection, Object will be created from SuperPitchIntervalChallenge 
 *
 * @export
 * @class SuperPitchDetectorNode
 * @extends {AnalyserNode}
 */
export class SuperPitchDetectorNode extends AnalyserNode {
    // TODO: better smoothing, doesnt do a lot now!

    // static methods

    /**
     * Returns the mean value of an array of numbers
     *
     * @static
     * @param {number[]} array The array of numbers
     * @return {number} The floating point mean value
     */
    static getArrayMeanValue(array) {
        const sum = array.reduce((sum, el) => sum + el);
        return sum / array.length;
    }

    // public props
    /** The "a4" in Hertz, by default 440 */
    a4;
    /** Determines if the Object is ready to start pitch detection */
    isReadyToDetect = false;
    /** Determines if the Object is detecting right now (should not be detecting twice at the same time) */
    isDetecting = false;
    /** The object containing the detected pitch, note, detuning */
    detected = {};
    /** The minimum threshold in dB (full scale) for pitch detection to work */
    rmsMinThreshdB;
    /** The threshold which amplitude will still be categorized as "zero crossing" */
    zeroCrossingThresh;
    /** The buffer containing the current audio input */
    pitchBuffer;

    // private props
    /** Old smoothing object */
    #smoothing = {};
    /** New smoothing object */
    #smoothingV2 = {};

    /**
     * Creates an instance of SuperPitchDetectorNode.
     * @param {AudioContext} context The global audio context
     * @param {object} [options={}] The options for pitch detection
     * @param {number} [options.a4=440] The "a4" frequency in Hertz
     * @param {number} [options.rmsMinThreshdB=-40] The pitch detection threshold in dB (full scale)
     * @param {number} [options.zeroCrossingThresh=0.2] The zero crossing threshold
     * @param {number} [options.smoothingFactor=5] The smoothing factor for the pitch detection
     */
    constructor(context, options={}) {
        super(context, options);

        this.a4 = options.a4 || 440;

        // Auto correlation options
        this.rmsMinThreshdB = options.rmsMinThreshdB || -40;       // minimum signal under which not to operate
        this.zeroCrossingThresh = options.zeroCrossingThresh || 0.2;  // threshold to shorten the buffer, probably zero crossing based

        this.pitchBuffer = new Float32Array(this.fftSize);

        this.#smoothing.frequencies = Array(10).fill(0);
        this.#smoothing.noteIndices = Array(10).fill(0);
        this.#smoothing.detunings = Array(10).fill(0);

        this.#smoothingV2.noteChange = Array(options.smoothingFactor || 5).fill(true);
        this.#smoothingV2.oldNote = null;
    }

    /**
     * Asks for Mic permission and opens the media stream - needs to be async called before pitch detection (either with async await or .then)!
     *
     */
    async init() {
        // use await to make .then outside of code possible, could also not use the .then in the function instead assign to const
        await navigator.mediaDevices.getUserMedia({
            "audio": {
                "autoGainControl": false,
                "echoCancellation": false,
                "noiseSuppression": false,
                "sampleRate": this.context.sampleRate,

            }
        })
        .then((stream) => {
            // Create an AudioNode from the stream.
            const mediaStreamSource = new MediaStreamAudioSourceNode(this.context, {mediaStream: stream});
            // Connect it to the destination.
            mediaStreamSource.connect( this );
            
            this.isReadyToDetect = true;
        })
        .catch((err) => {
            // always check for errors at the end.
            console.error(`${err.name}: ${err.message}`);
        });
    }

    
    /**
     * Callback for handling pitch detection
     *
     * @callback pitchDetectionHandler
     * @param {{rms: number, frequency: number, noteIndex: number, detuningInCents: number}} detected The object containing all the pitch detection information
     * @param {number} timestamp The new time stamp of the currently detected data
     * @param {number} oldTimestamp The previous time stamp, used to calculate the time passed since last detection
     */

    /**
     * Starts continuous pitch detection and writes detection data into the Object's detected variable. If passed, callbackFn will be called.
     *
     * @param {pitchDetectionHandler} [callbackFn=null] The callback function handling the detected pitch data
     */
    startDetecting(callbackFn=null) {
        if (!this.isReadyToDetect) return console.error('Not ready to detect pitch yet');
        if (this.isDetecting) return console.error('Already detecting pitch, why call me twice?');

        this.isDetecting = true;
        this.#constantDetection(callbackFn);
    }

    /**
     * Detects pitch information based on the current buffer
     * 
     * @returns {{rms: number, frequency: number, noteIndex: number, detuningInCents: number}} The detected pitch data
     */
    detectFromCurrentBuffer() {
        this.getFloatTimeDomainData(this.pitchBuffer);
        //console.info(this.pitchBuffer);
        const detected = this.autoCorrelate();
        if (detected.frequency > -1) {
            detected.noteIndex = SuperPitchIntervalChallenge.noteIndexFromFrequency(detected.frequency, this.a4);
            // smoothing v2
            if (this.#smoothingV2.oldNote !== detected.noteIndex) {
                this.#smoothingV2.noteChange.shift();
                this.#smoothingV2.noteChange.push(true);
                // check if noteChange Array contains only true -> smoothing threshold achieved
                if (this.#smoothingV2.noteChange.indexOf(false) === -1) {
                    // reset noteChange Array
                    this.resetSmoothing(false);
                    this.#smoothingV2.oldNote = detected.noteIndex;
                } else {
                    detected.noteIndex = this.#smoothingV2.oldNote;
                }
            }
            detected.detuningInCents = SuperPitchIntervalChallenge.detuningFromFrequency(detected.frequency, detected.noteIndex);
            // this.#smoothing.frequencies.shift();
            // this.#smoothing.frequencies.push(detected.frequency);
            // this.#smoothing.noteIndices.shift();
            // this.#smoothing.noteIndices.push(detected.noteIndex);
            // this.#smoothing.detunings.shift();
            // this.#smoothing.detunings.push(detected.detuningInCents);
            // detected.smoothed = {};
            // if (Math.min(...this.#smoothing.noteIndices) > 0) {
            //     detected.smoothed.frequency = SuperPitchDetectorNode.getArrayMeanValue(this.#smoothing.frequencies);
            //     detected.smoothed.noteIndex = Math.round(SuperPitchDetectorNode.getArrayMeanValue(this.#smoothing.noteIndices));
            //     detected.smoothed.detuningInCents = SuperPitchDetectorNode.getArrayMeanValue(this.#smoothing.detunings);
            // }
        } else {
            this.#smoothingV2.noteChange.fill(false);
        }
        return detected;
    }

    /**
     * Method that calls itself constantly and updates the local detected data
     * 
     * @param {pitchDetectionHandler} callbackFn The callback function handling the detection data
     * @param {number} timestamp The current timestamp
     * @param {number} oldTimestamp The timestamp of the last call
     */
    #constantDetection(callbackFn=null, timestamp=null, oldTimestamp=null) {
        if (!this.isDetecting) return;

        const detected = this.detectFromCurrentBuffer();

        if (callbackFn) {
            callbackFn(detected, timestamp, oldTimestamp);
        }
        this.detected = detected;
        requestAnimationFrame((newTimestamp) => { this.#constantDetection(callbackFn, newTimestamp, timestamp); });
    }

    /**
     * Stops the continuous pitch detection
     * 
     */
    stopDetecting() {
        this.isDetecting = false;
        this.resetSmoothing();
    }

    /**
     * Autocorrelates the current pitch buffer in order to detect the pitch frequency.
     * In most parts inspired by Chris Wilson's version from 2014 (https://github.com/cwilso/PitchDetect)
     * 
     * @returns {{rms: number, frequency: number}} The detected frequency and rms values
     */
    autoCorrelate() {
        // "ACF2+" Algorithm(?)

        let acBufferSize = this.pitchBuffer.length;
        // // check for signal
        let rms = 0;
        for (let i = 0; i < acBufferSize; i++) {
            rms += Math.pow(this.pitchBuffer[i], 2);
        }
        rms = Math.sqrt(rms / acBufferSize);
        if (SuperPitchIntervalChallenge.dBFSfromAmplitude(rms) < this.rmsMinThreshdB){
            return {
                rms: SuperPitchIntervalChallenge.dBFSfromAmplitude(rms),
                frequency: -1
            };
        }

        // narrow range down(?)
        let r1 = 0, r2 = acBufferSize-1;
        //console.log(`Initial R1: ${r1} - R2: ${r2}`);
        for (let i = 0; i < acBufferSize / 2; i++) {
            if (Math.abs(this.pitchBuffer[i] < this.zeroCrossingThresh)) {
                r1 = i;
                break;
            }
        }
        for (let i = 1; i < acBufferSize / 2; i++) {
            if (Math.abs(this.pitchBuffer[acBufferSize-i] < this.zeroCrossingThresh)) {
                r2 = acBufferSize - i;
                break;
            }
        }

        //console.log(`Final R1: ${r1} - R2: ${r2}`);

        const buffer = this.pitchBuffer.slice(r1, r2);
        acBufferSize = buffer.length;
        //console.log(`Shorter buffer size: ${bufferSize}`);

        // actual correlation
        const corrSums = new Array(acBufferSize).fill(0);
        for (let i = 0; i < acBufferSize; i++) {
            for (let j = 0; j < acBufferSize - i; j++) {
                corrSums[i] = corrSums[i] + buffer[j] * buffer[j + i];
            }
        }
        //console.log(corrSums);

        // probably go behind first half wave?
        let d = 0;
        while (corrSums[d] > corrSums[d + 1]) {
            d++;
        }
        //console.log(`Found d position: ${d}`);

        let maxPos = d, maxVal = -1;
        for (let i = d; i < acBufferSize; i++) {
            if (corrSums[i] > corrSums[maxPos]) {
                maxPos = i;
                //console.log(`New maxPos: ${i}`);
            }
        }

        let T0 = maxPos;

        //console.log(`First Freq: ${this.context.sampleRate / T0}`);

        // strange parabolic interpolation - is this good?
        const x1 = corrSums[T0 - 1], x2 = corrSums[T0], x3 = corrSums[T0 + 1];
        const a = (x1 + x3 - 2 * x2) / 2;
        const b = (x3 - x1) / 2;
        if (a) {
            T0 = T0 - b / (2 * a);
        }

        //console.log(`Final Freq: ${this.context.sampleRate / T0}`);

        return {
            rms: SuperPitchIntervalChallenge.dBFSfromAmplitude(rms),
            frequency: this.context.sampleRate / T0
        };
    }

    /**
     * Sets the new smoothing factor
     * 
     * @param {number} smoothingFactor The new smoothing factor, eg 5
     */
    setSmoothingFactor(smoothingFactor) {
        if (!smoothingFactor || smoothingFactor === this.#smoothing.frequencies.length) return;

        const factorDiff = smoothingFactor - this.#smoothing.frequencies.length;
        if (factorDiff > 0) {
            this.#smoothing.frequencies.unshift(...Array(factorDiff).fill(0));
            this.#smoothing.noteIndices.unshift(...Array(factorDiff).fill(0));
            this.#smoothing.detunings.unshift(...Array(factorDiff).fill(0));
        } else if (factorDiff < 0) {
            this.#smoothing.frequencies = this.#smoothing.frequencies.slice(-factorDiff);
            this.#smoothing.noteIndices = this.#smoothing.noteIndices.slice(-factorDiff);
            this.#smoothing.detunings = this.#smoothing.detunings.slice(-factorDiff);
        }

        console.log(`Set smoothing factor to ${smoothingFactor}`);
    }

    /**
     * Reset the smoothing values, eg when no input is present
     * 
     * @param {boolean} [eraseOldNote=true] If the old note value should be reset as well
     */
    resetSmoothing(eraseOldNote = true) {
        this.#smoothingV2.noteChange.fill(false);
        if (eraseOldNote) this.#smoothingV2.oldNote = null;
    }
}