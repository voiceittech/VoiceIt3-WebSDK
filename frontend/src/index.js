import Modal from './modal';
import vi$ from './utilities';
import api from './api';
import Prompts from './prompts';
import 'video.js/dist/video-js.min.css';
import 'videojs-wavesurfer/dist/css/videojs.wavesurfer.css';
import 'videojs-record/dist/css/videojs.record.css';
import videojs from 'video.js';
import 'webrtc-adapter';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
import Record from 'videojs-record/dist/videojs.record.js';

WaveSurfer.microphone = MicrophonePlugin;

// Register videojs-wavesurfer plugin

import 'semantic-ui-css/semantic.min.css';
import './vistyle.css';
import Colors from './colors';

// Constant Variables
const TIME_BEFORE_EXITING_MODAL_AFTER_SUCCESS = 2800;
const ErrorCodes = ['TVER', 'PNTE', 'NFEF', 'UNAC', 'UNFD'];
const MAX_ATTEMPTS = 3;

export function initialize(backendEndpointPath, language){
  var voiceIt2ObjRef = this;
  voiceIt2ObjRef.isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  voiceIt2ObjRef.setupView = async function(){
    voiceIt2ObjRef.secureToken = vi$.getValue('viSecureToken') || '';

    //REFACTOR
    voiceIt2ObjRef.modal = new Modal(voiceIt2ObjRef, language);
    voiceIt2ObjRef.apiRef = new api(voiceIt2ObjRef.modal, backendEndpointPath);
    voiceIt2ObjRef.enrollCounter = 0;
    // Variables needed for the audio/video streams, and for destroying instances
    voiceIt2ObjRef.viImageCanvasCtx;
    voiceIt2ObjRef.videoStream;
    voiceIt2ObjRef.attempts = 0;
    voiceIt2ObjRef.setupWaveForm = false;
    voiceIt2ObjRef.destroyed = false;
    voiceIt2ObjRef.phrase;
    voiceIt2ObjRef.contentLanguage;
    voiceIt2ObjRef.video;
    voiceIt2ObjRef.player;
    voiceIt2ObjRef.prompts = new Prompts(language);
    voiceIt2ObjRef.type = {
      biometricType: '',
      action: ''
    };
    voiceIt2ObjRef.isInitiated = false;
  }

  voiceIt2ObjRef.setThemeColor = function(hexColor){
    Colors.MAIN_THEME_COLOR = hexColor;
  }

  voiceIt2ObjRef.setPhrase = function(phrase) {
    voiceIt2ObjRef.phrase = phrase;
    voiceIt2ObjRef.prompts.setCurrentPhrase(phrase);
  }

  voiceIt2ObjRef.setSecureToken = function(secureToken){
    vi$.setValue('viSecureToken', secureToken);
  }
  // Main API Methods
  voiceIt2ObjRef.encapsulatedVoiceEnrollment = function(options) {
    voiceIt2ObjRef.setupView();
    voiceIt2ObjRef.type.biometricType = 'voice';
    voiceIt2ObjRef.type.action = 'Enrollment';
    voiceIt2ObjRef.setPhrase(options.phrase || '');
    voiceIt2ObjRef.contentLanguage = options.contentLanguage || '';
    voiceIt2ObjRef.completionCallback = options.completionCallback;
    if (!voiceIt2ObjRef.isInitiated) {
      voiceIt2ObjRef.initiate();
    }
  }

  voiceIt2ObjRef.encapsulatedFaceEnrollment = function(options) {
    voiceIt2ObjRef.setupView().then(function(){
      voiceIt2ObjRef.type.biometricType = 'face';
      voiceIt2ObjRef.type.action = 'Enrollment';
      voiceIt2ObjRef.completionCallback = options.completionCallback;
      if (!voiceIt2ObjRef.isInitiated) {
        voiceIt2ObjRef.initiate();
      }
    });
  }

  voiceIt2ObjRef.encapsulatedVideoEnrollment = function(options) {
    voiceIt2ObjRef.setupView().then(function(){
      voiceIt2ObjRef.type.biometricType = 'video';
      voiceIt2ObjRef.type.action = 'Enrollment';
      voiceIt2ObjRef.setPhrase(options.phrase || '');
      voiceIt2ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt2ObjRef.completionCallback = options.completionCallback;
      if (!voiceIt2ObjRef.isInitiated) {
        voiceIt2ObjRef.initiate();
      }
    });
  }

  voiceIt2ObjRef.encapsulatedVoiceVerification = function(options) {
    voiceIt2ObjRef.setupView().then(function(){
      voiceIt2ObjRef.type.biometricType = 'voice';
      voiceIt2ObjRef.type.action = 'Verification';
      voiceIt2ObjRef.setPhrase(options.phrase || '');
      voiceIt2ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt2ObjRef.completionCallback = options.completionCallback;
      voiceIt2ObjRef.apiRef.checkIfEnoughVoiceEnrollments(function(jsonResponse){
        if(jsonResponse.enoughEnrollments){
          if (!voiceIt2ObjRef.isInitiated) {
            voiceIt2ObjRef.initiate();
          }
        } else {
          options.needEnrollmentsCallback();
        }
      });
  });
  }

  voiceIt2ObjRef.encapsulatedFaceVerification = function(options) {
    voiceIt2ObjRef.setupView().then(function(){
      voiceIt2ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt2ObjRef.type.biometricType = 'face';
      voiceIt2ObjRef.type.action = 'Verification';
      voiceIt2ObjRef.completionCallback = options.completionCallback;
      voiceIt2ObjRef.apiRef.checkIfEnoughFaceEnrollments(function(jsonResponse){
        if(jsonResponse.enoughEnrollments){
          if (!voiceIt2ObjRef.isInitiated) {
            voiceIt2ObjRef.initiate();
          }
        } else {
          options.needEnrollmentsCallback();
        }
      });
    });
  }

  voiceIt2ObjRef.encapsulatedVideoVerification = function(options) {
    voiceIt2ObjRef.setupView().then(function(){
      voiceIt2ObjRef.type.biometricType = 'video';
      voiceIt2ObjRef.type.action = 'Verification';
      voiceIt2ObjRef.setPhrase(options.phrase || '');
      voiceIt2ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt2ObjRef.completionCallback = options.completionCallback;
      voiceIt2ObjRef.apiRef.checkIfEnoughVideoEnrollments(function(jsonResponse){
        if(jsonResponse.enoughEnrollments){
          if (!voiceIt2ObjRef.isInitiated) {
            voiceIt2ObjRef.initiate();
          }
        } else {
          options.needEnrollmentsCallback();
        }
      });
    });
  }

  voiceIt2ObjRef.continueToVoiceVerification = function(){
    voiceIt2ObjRef.modal.removeWaitingLoader();
    vi$.delay(300, function(){
        vi$.fadeOut(voiceIt2ObjRef.modal.domRef.progressCircle, 300);
    });
    voiceIt2ObjRef.modal.darkenCircle(true);
    setTimeout(function() {
      // voiceIt2ObjRef.overlayj.fadeTo(300, 0.3);
      voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('VERIFY'));

      voiceIt2ObjRef.player.record().start();
      // Record 5 Second Video
      setTimeout(function() {
        if (voiceIt2ObjRef.player !== undefined) {
          voiceIt2ObjRef.player.record().stop();
        }
      }, 5000);

      voiceIt2ObjRef.modal.createVideoCircle();
      setTimeout(function() {
        voiceIt2ObjRef.modal.createProgressCircle(5200);
        voiceIt2ObjRef.modal.revealProgressCircle(300);
      }, 200);
    }, 500);
  };

voiceIt2ObjRef.StopRecording = function() {
  if (voiceIt2ObjRef.player !== undefined) {
    voiceIt2ObjRef.player.record().stop();
  }
};

function destroyAndHideModal(){
  vi$.fadeOut(voiceIt2ObjRef.modal.domRef.modalDimBackground, 1100, function(){
        voiceIt2ObjRef.destroy();
        voiceIt2ObjRef.modal.hide();
    });
}

voiceIt2ObjRef.initModalClickListeners = function(){

      vi$.clickOn(voiceIt2ObjRef.modal.domRef.readyButton,
        function() {
            vi$.remove(voiceIt2ObjRef.modal.domRef.readyButton);
            voiceIt2ObjRef.startView();
            if (voiceIt2ObjRef.type.biometricType !== 'voice') {
              voiceIt2ObjRef.modal.revealProgressCircle(500);
            }
        }
      );

      document.addEventListener('keydown', function(e){
        var keyCode = e.keyCode;
        if(keyCode === 37) {
          vi$.qs(voiceIt2ObjRef.modal.domRef.leftArrowIcon).click();
        } else if(keyCode === 39){
          vi$.qs(voiceIt2ObjRef.modal.domRef.rightArrowIcon).click();
        }
      }, false);

      vi$.clickOn(voiceIt2ObjRef.modal.domRef.leftArrowIcon, function(){
          destroyAndHideModal();
      });

      // Proceed for enrollment
      vi$.clickOn(voiceIt2ObjRef.modal.domRef.rightArrowIcon, function() {
          voiceIt2ObjRef.apiRef.deleteAllEnrollments(voiceIt2ObjRef.handleDeletion)
          voiceIt2ObjRef.modal.hideWarningOverlay(300, function() {
            voiceIt2ObjRef.modal.showWaitingLoader();
          });
      });
  };

  // Called by the the start up buttons
  voiceIt2ObjRef.initiate = function() {
    voiceIt2ObjRef.player = undefined;
    voiceIt2ObjRef.destroyed = false;
    voiceIt2ObjRef.modal.build();
    voiceIt2ObjRef.setup();
    vi$.clickOn(voiceIt2ObjRef.modal.domRef.closeButton, function(){
        destroyAndHideModal();
    });
    // voiceIt2ObjRef.initModalClickListeners();
  };

  voiceIt2ObjRef.handleDeletion = function(response) {
    if (response.responseCode === 'SUCC') {
      voiceIt2ObjRef.modal.hideWarningOverlay(500, function() {
        if (voiceIt2ObjRef.type.biometricType === 'voice') {
          voiceIt2ObjRef.modal.createWaveform();
        } else {
          vi$.fadeIn(voiceIt2ObjRef.modal.domRef.imageCanvas, 500);
        }
        voiceIt2ObjRef.modal.domRef.readyButton.style.display = 'inline-block';
        vi$.fadeIn(voiceIt2ObjRef.modal.domRef.readyButton, 500);
      });
    } else {
      //show an erroe message
      voiceIt2ObjRef.modal.removeWaitingLoader();
      voiceIt2ObjRef.modal.displayMessage(response.message);
    }
  };

  voiceIt2ObjRef.displayAppropriateMessage = function(response) {
    // setTimeout(function() {
      // voiceIt2ObjRef.waitj.fadeTo(300, 0.0, function() {
    if (response.responseCode === 'SUCC') {
      if (voiceIt2ObjRef.type.action === 'Verification') {
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('SUCC_VERIFICATION'));
      } else {
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('SUCC_ENROLLMENT'));
      }
    } else {
      voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt(response.responseCode));
    }
  };

  voiceIt2ObjRef.setup = function() {
    voiceIt2ObjRef.modal.domRef.readyButton.style.display = 'none';
    voiceIt2ObjRef.modal.domRef.readyButton.style.opacity = 0;
    voiceIt2ObjRef.modal.domRef.outerOverlay.style.opacity = 0;
    voiceIt2ObjRef.showLoadingOverlay();
    if (voiceIt2ObjRef.type.biometricType === 'voice') {
      voiceIt2ObjRef.handleVoiceSetup();
    } else if (voiceIt2ObjRef.type.biometricType === 'face') {
      voiceIt2ObjRef.handleFaceSetup();
    } else {
      voiceIt2ObjRef.handleVideoSetup();
    }
  };

  //ready up animations and stuff for voice enroll/verific.
  voiceIt2ObjRef.handleVoiceSetup = function() {
    voiceIt2ObjRef.attempts = 0;
    voiceIt2ObjRef.initVoiceRecord();
    voiceIt2ObjRef.modal.show();
  };

  //ready up animations and stuff for face enroll/verific.
  voiceIt2ObjRef.handleFaceSetup = function() {
    voiceIt2ObjRef.initFaceRecord();
    voiceIt2ObjRef.attempts = 0;
    voiceIt2ObjRef.createVideo();
    voiceIt2ObjRef.createOverlay();
    voiceIt2ObjRef.modal.domRef.outerOverlay.style.opacity = 1.0;
    voiceIt2ObjRef.modal.show();
  };

  // Ready up animations and stuff for video enroll/verific.
  voiceIt2ObjRef.handleVideoSetup = function() {
    voiceIt2ObjRef.initVideoRecord();
    voiceIt2ObjRef.createOverlay();
    voiceIt2ObjRef.attempts = 0;
    voiceIt2ObjRef.createVideo();
    voiceIt2ObjRef.modal.domRef.outerOverlay.style.opacity = 1.0;
    voiceIt2ObjRef.modal.show();
  };

  voiceIt2ObjRef.createVideo = function() {
    let webcam = vi$.create('video');
    const imageScaleFactor = 0.5
    webcam.setAttribute('class', 'viVideo video-js vjs-default-skin');
    webcam.height = 480;
    webcam.width = 640;
    document.body.appendChild(webcam);
    voiceIt2ObjRef.viImageCanvasCtx = voiceIt2ObjRef.modal.domRef.imageCanvas.getContext('2d');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        height: 480,
        width: 640
      },
      frameRate: 30
    }).then(
      function(stream) {
        webcam.srcObject = stream;
        webcam.onloadedmetadata = function() {
          webcam.play();
          voiceIt2ObjRef.videoStream = stream;
        }
      }
    ).catch(function(err) {
      console.log('index.js navigator.mediaDevices.getUserMedia Exception: ', err);
    });


  async function poseDetectionFrame() {

      // Mirror the video by drawing it onto the canvas
      voiceIt2ObjRef.viImageCanvasCtx.clearRect(0, 0, webcam.videoWidth, webcam.videoHeight);
      voiceIt2ObjRef.viImageCanvasCtx.save();
      voiceIt2ObjRef.viImageCanvasCtx.setTransform(-1.0, 0, 0, 1, webcam.videoWidth, 0);
      voiceIt2ObjRef.viImageCanvasCtx.drawImage(webcam, 0, 0, webcam.videoWidth, webcam.videoHeight);
      voiceIt2ObjRef.viImageCanvasCtx.restore();
      voiceIt2ObjRef.animationId = window.requestAnimationFrame(poseDetectionFrame);
    }
    poseDetectionFrame();
  };

  // Set up videoJS for voice
  voiceIt2ObjRef.initVoiceRecord = function() {
    var audio = vi$.create('audio');
    audio.setAttribute('id', 'myAudio');
    audio.setAttribute('class', 'video-js vjs-default-skin');
    document.body.appendChild(audio);
    voiceIt2ObjRef.player = videojs('myAudio', {
      controls:false,
      width: 200,
      height: 200,
      fluid: false,
      plugins: {
        wavesurfer: {
            backend: 'WebAudio',
            waveColor: '#36393b',
            progressColor: 'black',
            debug: true,
            cursorWidth: 1,
            hideScrollbar: true,
            plugins: [
                // enable microphone plugin
                WaveSurfer.microphone.create({
                    bufferSize: 4096,
                    numberOfInputChannels: 1,
                    numberOfOutputChannels: 1,
                    constraints: {
                        video: false,
                        audio: true
                    }
                })
            ]
        },
        record: {
          audio: true,
          video: false,
          maxLength: 5,
          debug: true
        }
      }
    });
    voiceIt2ObjRef.setupListeners();
  };

  // Set up videoJS for video
  voiceIt2ObjRef.initVideoRecord = function() {
    var video = vi$.create('video');
    video.setAttribute('id', 'videoRecord');
    video.setAttribute('class', 'video-js vjs-default-skin');
    document.body.appendChild(video);
    voiceIt2ObjRef.player = videojs('videoRecord', {
      controls: false,
      width: 640,
      height: 480,
      fluid: false,
      plugins: {
        record: {
          audio: true,
          video: true,
          maxLength: 5
        }
      }
    }, function() {
      // Print version information at startup
    });
    voiceIt2ObjRef.setupListeners();
  };

  // Set up videoJS for face
  voiceIt2ObjRef.initFaceRecord = function() {
    var video = vi$.create('video');
    video.setAttribute('id', 'videoRecord');
    video.setAttribute('class', 'video-js vjs-default-skin');
    document.body.appendChild(video);
    voiceIt2ObjRef.player = videojs('videoRecord', {
      controls: true,
      width: 640,
      height: 480,
      fluid: false,
      controlBar: {
        fullscreenToggle: false,
        volumePanel: false
      },
      plugins: {
        record: {
          audio: false,
          video: true,
          maxLength: 3,
          debug: true
        }
      }
    }, function() {
    });
    voiceIt2ObjRef.setupListeners();
  };

  voiceIt2ObjRef.handleVerificationResponse = function(response){
    voiceIt2ObjRef.modal.removeWaitingLoader();
    if (response.responseCode === 'SUCC') {
      voiceIt2ObjRef.completionCallback(true, response);
      voiceIt2ObjRef.exitOut(true, response);
      voiceIt2ObjRef.displayAppropriateMessage(response);
    } else {
      voiceIt2ObjRef.attempts++;
      //continue to verify
      if (voiceIt2ObjRef.attempts > MAX_ATTEMPTS) {
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('MAX_ATTEMPTS'));
        voiceIt2ObjRef.completionCallback(false, response);
        voiceIt2ObjRef.exitOut(false, response);
      } else {
        voiceIt2ObjRef.displayAppropriateMessage(response);
        if(vi$.contains(ErrorCodes, response.responseCode)) {
          voiceIt2ObjRef.completionCallback(false, response);
            voiceIt2ObjRef.exitOut(false, response);
        } else {
            voiceIt2ObjRef.continueVerification(response);
        }

      }
    }
  };

  voiceIt2ObjRef.handleEnrollmentResponse = function(response){
    voiceIt2ObjRef.modal.removeWaitingLoader();
    // Handle enrollment success;
    if (response.responseCode === 'SUCC') {
      if (voiceIt2ObjRef.enrollCounter < 3) {
        voiceIt2ObjRef.enrollCounter++;
        voiceIt2ObjRef.continueEnrollment(response);
      }
    } else {
      voiceIt2ObjRef.attempts++;
      if (voiceIt2ObjRef.attempts > MAX_ATTEMPTS) {
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('MAX_ATTEMPTS'));
        voiceIt2ObjRef.completionCallback(false, response);
        voiceIt2ObjRef.exitOut(false, response);
      } else {
        voiceIt2ObjRef.continueEnrollment(response);
      }
    }
  };


  // One-time setup for the listeners to prevent duplicate api calls/records
  voiceIt2ObjRef.setupListeners = function() {

    voiceIt2ObjRef.player.on('ready', function() {
      voiceIt2ObjRef.player.record().getDevice();
    });

    voiceIt2ObjRef.player.on('deviceError', function() {
      //permission not granted
      //could'nt start recording device please try again.
      // remove ready button, show that 'permission not granted'
      voiceIt2ObjRef.modal.domRef.readyButton.style.display = 'none';
      voiceIt2ObjRef.modal.displayMessage('Recording permission not granted, please refresh and try again');
    });

    //called before deviceError above
    voiceIt2ObjRef.player.on('error', function(error) {
      console.log("index.js voiceIt2ObjRef.player.on('error') : ", error);
    });

    voiceIt2ObjRef.player.on('deviceReady', function() {
      //setup listners here
      if (voiceIt2ObjRef.type.action === 'Enrollment') {
        voiceIt2ObjRef.modal.showEnrollmentDeletionWarningOverlay();
      }
      voiceIt2ObjRef.initModalClickListeners();
      voiceIt2ObjRef.modal.domRef.readyButton.style.display = 'inline-block';
    });

    voiceIt2ObjRef.player.on('startRecord', function() {
    });

    voiceIt2ObjRef.player.on('finishRecord', function() {
      if (voiceIt2ObjRef.player.recordedData !== undefined) {
        //check the size of the file
        if (voiceIt2ObjRef.player.recordedData.size > 0){
          voiceIt2ObjRef.player.recordedData = voiceIt2ObjRef.player.recordedData;
          voiceIt2ObjRef.handleFinishRecording();
        } else {
          //re check the size of the file after 200ms
          setTimeout(()=>{
            if (voiceIt2ObjRef.player.recordedData.size > 0){
              voiceIt2ObjRef.player.recordedData = voiceIt2ObjRef.player.recordedData;
              voiceIt2ObjRef.handleFinishRecording();
            } else {
              //show error and return
              voiceIt2ObjRef.modal.removeWaitingLoader();
              voiceIt2ObjRef.modal.displayMessage('Recording error occurred, please try again');
            }
          },200);
        }
      } else {
        //show error message
        voiceIt2ObjRef.modal.removeWaitingLoader();
        voiceIt2ObjRef.modal.displayMessage('Recording error occurred, please try again');
        return;
      }
    });
  };

  voiceIt2ObjRef.handleFinishRecording = function(){
      vi$.fadeIn(voiceIt2ObjRef.modal.domRef.outerOverlay, 300, null, 0.3);
      voiceIt2ObjRef.modal.showWaitingLoader(true);

      if(
        voiceIt2ObjRef.type.biometricType === 'voice' &&
        voiceIt2ObjRef.type.action === 'Verification'
      ){
        voiceIt2ObjRef.apiRef.voiceVerification({
          viContentLanguage: voiceIt2ObjRef.contentLanguage,
          viPhrase: voiceIt2ObjRef.phrase,
          viVoiceData : voiceIt2ObjRef.player.recordedData
        }, function(response){
          voiceIt2ObjRef.handleVerificationResponse(response);
        });
      }

      if(
        voiceIt2ObjRef.type.biometricType === 'face' &&
        voiceIt2ObjRef.type.action === 'Verification'
      ){
          voiceIt2ObjRef.apiRef.faceVerification({
            viVideoData : voiceIt2ObjRef.player.recordedData
          }, function(response){
            voiceIt2ObjRef.handleVerificationResponse(response);
        });
      }

      if(
        voiceIt2ObjRef.type.biometricType === 'video' &&
        voiceIt2ObjRef.type.action === 'Verification'
      ){
        voiceIt2ObjRef.apiRef.videoVerification({
          viContentLanguage: voiceIt2ObjRef.contentLanguage,
          viPhrase: voiceIt2ObjRef.phrase,
          viVideoData : voiceIt2ObjRef.player.recordedData
        }, function(response){
          voiceIt2ObjRef.handleVerificationResponse(response);
        });
      }

      if(voiceIt2ObjRef.type.biometricType === 'voice' && voiceIt2ObjRef.type.action === 'Enrollment'){
        voiceIt2ObjRef.apiRef.createVoiceEnrollment({
          viContentLanguage: voiceIt2ObjRef.contentLanguage,
          viPhrase: voiceIt2ObjRef.phrase,
          viVoiceData : voiceIt2ObjRef.player.recordedData
        }, function(response){
          voiceIt2ObjRef.handleEnrollmentResponse(response);
        });
      }

      if(voiceIt2ObjRef.type.biometricType === 'face' && voiceIt2ObjRef.type.action === 'Enrollment'){
        voiceIt2ObjRef.apiRef.createFaceEnrollment({
          viVideoData : voiceIt2ObjRef.player.recordedData
        }, function(response){
          voiceIt2ObjRef.handleEnrollmentResponse(response);
        });
      }

      if(voiceIt2ObjRef.type.biometricType === 'video' && voiceIt2ObjRef.type.action === 'Enrollment'){
        voiceIt2ObjRef.apiRef.createVideoEnrollment({
          viContentLanguage: voiceIt2ObjRef.contentLanguage,
          viPhrase: voiceIt2ObjRef.phrase,
          viVideoData : voiceIt2ObjRef.player.recordedData
        }, function(response){
          voiceIt2ObjRef.handleEnrollmentResponse(response);
        });
      }
}

  ///REFACTOR
  voiceIt2ObjRef.startView = function() {
    if (voiceIt2ObjRef.type.action === 'Verification' && voiceIt2ObjRef.type.biometricType === 'voice') {
      voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('VERIFY'));
      voiceIt2ObjRef.modal.revealWaveform(500);
    }

      if (voiceIt2ObjRef.type.biometricType === 'face') {
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('LOOK_INTO_CAM'));
        voiceIt2ObjRef.modal.createProgressCircle(3200);
        voiceIt2ObjRef.modal.revealProgressCircle();
      } else if (voiceIt2ObjRef.type.biometricType === 'video') {
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('VERIFY'));
          voiceIt2ObjRef.modal.revealWaveform(500);
          voiceIt2ObjRef.modal.createVideoCircle();
          voiceIt2ObjRef.modal.createProgressCircle(5200);
          voiceIt2ObjRef.modal.domRef.progressCircle.style.display = 'block';
          voiceIt2ObjRef.modal.revealProgressCircle();
      } else if (voiceIt2ObjRef.type.biometricType === 'voice'){
          voiceIt2ObjRef.modal.revealWaveform(500);
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('VERIFY'));
      }

      // if (voiceIt2ObjRef.type.biometricType === 'voice') {
      //   voiceIt2ObjRef.modal.revealWaveform(500);
      // } else if (voiceIt2ObjRef.type.biometricType === 'face') {
      //   voiceIt2ObjRef.modal.createProgressCircle(3200);
      //   voiceIt2ObjRef.modal.revealProgressCircle();
      // } else if (voiceIt2ObjRef.type.biometricType === 'video') {
      //   voiceIt2ObjRef.modal.createVideoCircle();
      //   voiceIt2ObjRef.modal.createProgressCircle(5200);
      //   voiceIt2ObjRef.modal.domRef.progressCircle.style.display = 'block';
      //   voiceIt2ObjRef.modal.revealProgressCircle();
      // }

    vi$.fadeOut(voiceIt2ObjRef.modal.domRef.outerOverlay, 1500, null, 0.3);
    voiceIt2ObjRef.modal.domRef.readyButton.style.display = 'none';
    if(voiceIt2ObjRef.player) {
      voiceIt2ObjRef.player.record().start();
    }
  };

  voiceIt2ObjRef.continueEnrollment = function(response) {
    // Handle the response (can use displayAppropriateMessage() method- will see it later on)
    if (voiceIt2ObjRef.type.biometricType !== 'face') {
      if (response.responseCode === 'SUCC') {
        // TODO: Refactor getting prompts based on counter
        if (voiceIt2ObjRef.enrollCounter === 1) {
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_1'));
        } else if (voiceIt2ObjRef.enrollCounter === 2) {
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_2'));
        } else if (voiceIt2ObjRef.enrollCounter === 3) {
          if (voiceIt2ObjRef.type.biometricType === 'voice') {
            voiceIt2ObjRef.enrollmentNeededVoice = false;
          } else {
            voiceIt2ObjRef.enrollmentNeededVideo = false;
          }
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_3'));
          voiceIt2ObjRef.completionCallback(true, response);
          voiceIt2ObjRef.exitOut(true, response);
        }
      } else {
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt(response.responseCode));
      }
        voiceIt2ObjRef.modal.removeWaitingLoader();

    } else if (voiceIt2ObjRef.type.biometricType === 'face') {
      if (response.responseCode === 'SUCC') {
        // voiceIt2ObjRef.enrollmentNeededFace = false;
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_3'));
        voiceIt2ObjRef.completionCallback(true, response);
        voiceIt2ObjRef.exitOut(true, response);
      }
      //handle re-recording and animations for face
      else {
        setTimeout(function() {
          voiceIt2ObjRef.modal.hideProgressCircle(350);
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('LOOK_INTO_CAM'));
          voiceIt2ObjRef.modal.createProgressCircle(5200);
          voiceIt2ObjRef.modal.revealProgressCircle(350);
          vi$.fadeOut(voiceIt2ObjRef.modal.domRef.outerOverlay, 500, function(){
            voiceIt2ObjRef.player.record().start();
          });
        }, 2000);
        voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt(response.responseCode));
      }
  }

    // Handle re-recording and prompts/animations along with it (for voice/video)
    if (voiceIt2ObjRef.enrollCounter < 3 && voiceIt2ObjRef.type.biometricType !== 'face') {
      setTimeout(function() {
        voiceIt2ObjRef.modal.hideProgressCircle(350);
        if (voiceIt2ObjRef.enrollCounter >= 0) {
            voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('ENROLL_' + voiceIt2ObjRef.enrollCounter));
        }

        if (voiceIt2ObjRef.type.biometricType === 'video') {
          vi$.fadeOut(voiceIt2ObjRef.modal.domRef.outerOverlay, 500, function(){
            voiceIt2ObjRef.player.record().start();
          });
        }

        if (voiceIt2ObjRef.type.biometricType === 'voice') {
          voiceIt2ObjRef.modal.hideProgressCircle();
          voiceIt2ObjRef.player.record().start();
        } else {
            voiceIt2ObjRef.modal.hideProgressCircle(350);
            if (voiceIt2ObjRef.type.biometricType === 'face'){
              voiceIt2ObjRef.modal.createProgressCircle(3200);
            } else {
            voiceIt2ObjRef.modal.createProgressCircle(5200);
            }
            voiceIt2ObjRef.modal.revealProgressCircle(350);
        }
      }, 2000);
    }
  };

  //continue verification if errors, response codes, etc
  voiceIt2ObjRef.continueVerification = function() {
    if(voiceIt2ObjRef.destroyed){ return ;}
    setTimeout(function() {
      voiceIt2ObjRef.modal.hideProgressCircle(350);
      if (voiceIt2ObjRef.type.biometricType === 'face') {
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('LOOK_INTO_CAM'));
      } else {
          voiceIt2ObjRef.modal.displayMessage(voiceIt2ObjRef.prompts.getPrompt('VERIFY'));
      }
      if (voiceIt2ObjRef.type.biometricType === 'voice') {
        voiceIt2ObjRef.modal.revealWaveform(500, function() {
          voiceIt2ObjRef.player.record().start();
        });
      } else {
        voiceIt2ObjRef.modal.hideProgressCircle(350);
        vi$.fadeOut(voiceIt2ObjRef.modal.domRef.outerOverlay, 500, function(){
          if(voiceIt2ObjRef.player){
            voiceIt2ObjRef.player.record().start();
          }
          voiceIt2ObjRef.modal.revealProgressCircle(350);
          if (voiceIt2ObjRef.type.biometricType === 'face'){
            voiceIt2ObjRef.modal.createProgressCircle(3200);
          } else {
          voiceIt2ObjRef.modal.createProgressCircle(5200);
          }
        });
      }
    }, 2000);
  };



  voiceIt2ObjRef.showLoadingOverlay = function() {
    if (voiceIt2ObjRef.type.action !== 'Enrollment') {
      if(voiceIt2ObjRef.type.biometricType === 'voice'){
        voiceIt2ObjRef.modal.createWaveform();
      } else {
        voiceIt2ObjRef.modal.domRef.imageCanvas.style.opacity = '1.0';
      }
      voiceIt2ObjRef.modal.domRef.readyButton.style.display = 'inline-block';
      voiceIt2ObjRef.modal.domRef.readyButton.style.opacity = '1.0';
    }
  };

  // Exit the modal post completion of task
  voiceIt2ObjRef.exitOut = function (success, response){
    if (!voiceIt2ObjRef.destroyed){
      vi$.delay(TIME_BEFORE_EXITING_MODAL_AFTER_SUCCESS, function(){
        vi$.fadeOut(voiceIt2ObjRef.modal.domRef.modalDimBackground, 1100, function(){
              voiceIt2ObjRef.destroy();
              voiceIt2ObjRef.modal.hide();
        });
      });
    }
  };

  // Destroy video, canvas, and other objects
  voiceIt2ObjRef.destroy = function(destroyFinished) {
    window.cancelAnimationFrame(voiceIt2ObjRef.animationId);
    voiceIt2ObjRef.isInitiated = false;
    vi$.remove('#viVideo');
    if (voiceIt2ObjRef.type.biometricType !== 'voice') {
      vi$.remove(voiceIt2ObjRef.modal.domRef.imageCanvas);
    }

    if (voiceIt2ObjRef.videoStream !== undefined) {
      voiceIt2ObjRef.videoStream.getTracks()[0].stop();
      voiceIt2ObjRef.videoStream = undefined;
    }

    if (voiceIt2ObjRef.player !== undefined) {
      voiceIt2ObjRef.player.off('finishRecord', function(){

      });
      voiceIt2ObjRef.player.record().destroy();
      voiceIt2ObjRef.player = undefined;
    }

    if (voiceIt2ObjRef.modal.domRef.readyButton) {
       voiceIt2ObjRef.modal.domRef.readyButton.style.display = 'none';
    }

    if (voiceIt2ObjRef.type.biometricType !== 'voice') {
      if(voiceIt2ObjRef.modal.domRef.imageCanvas){
        var ctx = voiceIt2ObjRef.modal.domRef.imageCanvas.getContext('2d');
        ctx.clearRect(0, 0, voiceIt2ObjRef.modal.domRef.imageCanvas.width, voiceIt2ObjRef.modal.domRef.imageCanvas.height);
      }
    }

    voiceIt2ObjRef.modal.destroy();
    voiceIt2ObjRef.destroyed = true;
    if(destroyFinished){ destroyFinished();}
  };

  voiceIt2ObjRef.createOverlay = function() {
    var ctx2 = voiceIt2ObjRef.modal.domRef.overlayCanvas;
    var context2 = ctx2.getContext('2d');
    context2.beginPath();
    context2.arc(230, 148, 131, 0, 2 * Math.PI);
    context2.rect(460, 0, -460, 345);
    context2.fillStyle = 'rgba(0,0,0,1.0)';
    context2.fill('evenodd');
  };

  return this;
};
