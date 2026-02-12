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
  var voiceIt3ObjRef = this;
  voiceIt3ObjRef.isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  voiceIt3ObjRef.setupView = async function(){
    voiceIt3ObjRef.secureToken = vi$.getValue('viSecureToken') || '';

    //REFACTOR
    voiceIt3ObjRef.modal = new Modal(voiceIt3ObjRef, language);
    voiceIt3ObjRef.apiRef = new api(voiceIt3ObjRef.modal, backendEndpointPath);
    voiceIt3ObjRef.enrollCounter = 0;
    // Variables needed for the audio/video streams, and for destroying instances
    voiceIt3ObjRef.viImageCanvasCtx;
    voiceIt3ObjRef.videoStream;
    voiceIt3ObjRef.attempts = 0;
    voiceIt3ObjRef.setupWaveForm = false;
    voiceIt3ObjRef.destroyed = false;
    voiceIt3ObjRef.phrase;
    voiceIt3ObjRef.contentLanguage;
    voiceIt3ObjRef.video;
    voiceIt3ObjRef.player;
    voiceIt3ObjRef.prompts = new Prompts(language);
    voiceIt3ObjRef.type = {
      biometricType: '',
      action: ''
    };
    voiceIt3ObjRef.isInitiated = false;
  }

  voiceIt3ObjRef.setThemeColor = function(hexColor){
    Colors.MAIN_THEME_COLOR = hexColor;
  }

  voiceIt3ObjRef.setPhrase = function(phrase) {
    voiceIt3ObjRef.phrase = phrase;
    voiceIt3ObjRef.prompts.setCurrentPhrase(phrase);
  }

  voiceIt3ObjRef.setSecureToken = function(secureToken){
    vi$.setValue('viSecureToken', secureToken);
  }
  // Main API Methods
  voiceIt3ObjRef.encapsulatedVoiceEnrollment = function(options) {
    voiceIt3ObjRef.setupView();
    voiceIt3ObjRef.type.biometricType = 'voice';
    voiceIt3ObjRef.type.action = 'Enrollment';
    voiceIt3ObjRef.setPhrase(options.phrase || '');
    voiceIt3ObjRef.contentLanguage = options.contentLanguage || '';
    voiceIt3ObjRef.completionCallback = options.completionCallback;
    if (!voiceIt3ObjRef.isInitiated) {
      voiceIt3ObjRef.initiate();
    }
  }

  voiceIt3ObjRef.encapsulatedFaceEnrollment = function(options) {
    voiceIt3ObjRef.setupView().then(function(){
      voiceIt3ObjRef.type.biometricType = 'face';
      voiceIt3ObjRef.type.action = 'Enrollment';
      voiceIt3ObjRef.completionCallback = options.completionCallback;
      if (!voiceIt3ObjRef.isInitiated) {
        voiceIt3ObjRef.initiate();
      }
    });
  }

  voiceIt3ObjRef.encapsulatedVideoEnrollment = function(options) {
    voiceIt3ObjRef.setupView().then(function(){
      voiceIt3ObjRef.type.biometricType = 'video';
      voiceIt3ObjRef.type.action = 'Enrollment';
      voiceIt3ObjRef.setPhrase(options.phrase || '');
      voiceIt3ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt3ObjRef.completionCallback = options.completionCallback;
      if (!voiceIt3ObjRef.isInitiated) {
        voiceIt3ObjRef.initiate();
      }
    });
  }

  voiceIt3ObjRef.encapsulatedVoiceVerification = function(options) {
    voiceIt3ObjRef.setupView().then(function(){
      voiceIt3ObjRef.type.biometricType = 'voice';
      voiceIt3ObjRef.type.action = 'Verification';
      voiceIt3ObjRef.setPhrase(options.phrase || '');
      voiceIt3ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt3ObjRef.completionCallback = options.completionCallback;
      voiceIt3ObjRef.apiRef.checkIfEnoughVoiceEnrollments(function(jsonResponse){
        if(jsonResponse.enoughEnrollments){
          if (!voiceIt3ObjRef.isInitiated) {
            voiceIt3ObjRef.initiate();
          }
        } else {
          options.needEnrollmentsCallback();
        }
      });
  });
  }

  voiceIt3ObjRef.encapsulatedFaceVerification = function(options) {
    voiceIt3ObjRef.setupView().then(function(){
      voiceIt3ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt3ObjRef.type.biometricType = 'face';
      voiceIt3ObjRef.type.action = 'Verification';
      voiceIt3ObjRef.completionCallback = options.completionCallback;
      voiceIt3ObjRef.apiRef.checkIfEnoughFaceEnrollments(function(jsonResponse){
        if(jsonResponse.enoughEnrollments){
          if (!voiceIt3ObjRef.isInitiated) {
            voiceIt3ObjRef.initiate();
          }
        } else {
          options.needEnrollmentsCallback();
        }
      });
    });
  }

  voiceIt3ObjRef.encapsulatedVideoVerification = function(options) {
    voiceIt3ObjRef.setupView().then(function(){
      voiceIt3ObjRef.type.biometricType = 'video';
      voiceIt3ObjRef.type.action = 'Verification';
      voiceIt3ObjRef.setPhrase(options.phrase || '');
      voiceIt3ObjRef.contentLanguage = options.contentLanguage || '';
      voiceIt3ObjRef.completionCallback = options.completionCallback;
      voiceIt3ObjRef.apiRef.checkIfEnoughVideoEnrollments(function(jsonResponse){
        if(jsonResponse.enoughEnrollments){
          if (!voiceIt3ObjRef.isInitiated) {
            voiceIt3ObjRef.initiate();
          }
        } else {
          options.needEnrollmentsCallback();
        }
      });
    });
  }

  voiceIt3ObjRef.continueToVoiceVerification = function(){
    voiceIt3ObjRef.modal.removeWaitingLoader();
    vi$.delay(300, function(){
        vi$.fadeOut(voiceIt3ObjRef.modal.domRef.progressCircle, 300);
    });
    voiceIt3ObjRef.modal.darkenCircle(true);
    setTimeout(function() {
      // voiceIt3ObjRef.overlayj.fadeTo(300, 0.3);
      voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('VERIFY'));

      voiceIt3ObjRef.player.record().start();
      // Record 5 Second Video
      setTimeout(function() {
        if (voiceIt3ObjRef.player !== undefined) {
          voiceIt3ObjRef.player.record().stop();
        }
      }, 5000);

      voiceIt3ObjRef.modal.createVideoCircle();
      setTimeout(function() {
        voiceIt3ObjRef.modal.createProgressCircle(5200);
        voiceIt3ObjRef.modal.revealProgressCircle(300);
      }, 200);
    }, 500);
  };

voiceIt3ObjRef.StopRecording = function() {
  if (voiceIt3ObjRef.player !== undefined) {
    voiceIt3ObjRef.player.record().stop();
  }
};

function destroyAndHideModal(){
  vi$.fadeOut(voiceIt3ObjRef.modal.domRef.modalDimBackground, 1100, function(){
        voiceIt3ObjRef.destroy();
        voiceIt3ObjRef.modal.hide();
    });
}

voiceIt3ObjRef.initModalClickListeners = function(){

      vi$.clickOn(voiceIt3ObjRef.modal.domRef.readyButton,
        function() {
            vi$.remove(voiceIt3ObjRef.modal.domRef.readyButton);
            voiceIt3ObjRef.startView();
            if (voiceIt3ObjRef.type.biometricType !== 'voice') {
              voiceIt3ObjRef.modal.revealProgressCircle(500);
            }
        }
      );

      document.addEventListener('keydown', function(e){
        var keyCode = e.keyCode;
        if(keyCode === 37) {
          vi$.qs(voiceIt3ObjRef.modal.domRef.leftArrowIcon).click();
        } else if(keyCode === 39){
          vi$.qs(voiceIt3ObjRef.modal.domRef.rightArrowIcon).click();
        }
      }, false);

      vi$.clickOn(voiceIt3ObjRef.modal.domRef.leftArrowIcon, function(){
          destroyAndHideModal();
      });

      // Proceed for enrollment
      vi$.clickOn(voiceIt3ObjRef.modal.domRef.rightArrowIcon, function() {
          voiceIt3ObjRef.apiRef.deleteAllEnrollments(voiceIt3ObjRef.handleDeletion)
          voiceIt3ObjRef.modal.hideWarningOverlay(300, function() {
            voiceIt3ObjRef.modal.showWaitingLoader();
          });
      });
  };

  // Called by the the start up buttons
  voiceIt3ObjRef.initiate = function() {
    voiceIt3ObjRef.player = undefined;
    voiceIt3ObjRef.destroyed = false;
    voiceIt3ObjRef.modal.build();
    voiceIt3ObjRef.setup();
    vi$.clickOn(voiceIt3ObjRef.modal.domRef.closeButton, function(){
        destroyAndHideModal();
    });
    // voiceIt3ObjRef.initModalClickListeners();
  };

  voiceIt3ObjRef.handleDeletion = function(response) {
    if (response.responseCode === 'SUCC') {
      voiceIt3ObjRef.modal.hideWarningOverlay(500, function() {
        if (voiceIt3ObjRef.type.biometricType === 'voice') {
          voiceIt3ObjRef.modal.createWaveform();
        } else {
          vi$.fadeIn(voiceIt3ObjRef.modal.domRef.imageCanvas, 500);
        }
        voiceIt3ObjRef.modal.domRef.readyButton.style.display = 'inline-block';
        vi$.fadeIn(voiceIt3ObjRef.modal.domRef.readyButton, 500);
      });
    } else {
      //show an erroe message
      voiceIt3ObjRef.modal.removeWaitingLoader();
      voiceIt3ObjRef.modal.displayMessage(response.message);
    }
  };

  voiceIt3ObjRef.displayAppropriateMessage = function(response) {
    // setTimeout(function() {
      // voiceIt3ObjRef.waitj.fadeTo(300, 0.0, function() {
    if (response.responseCode === 'SUCC') {
      if (voiceIt3ObjRef.type.action === 'Verification') {
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('SUCC_VERIFICATION'));
      } else {
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('SUCC_ENROLLMENT'));
      }
    } else {
      voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt(response.responseCode));
    }
  };

  voiceIt3ObjRef.setup = function() {
    voiceIt3ObjRef.modal.domRef.readyButton.style.display = 'none';
    voiceIt3ObjRef.modal.domRef.readyButton.style.opacity = 0;
    voiceIt3ObjRef.modal.domRef.outerOverlay.style.opacity = 0;
    voiceIt3ObjRef.showLoadingOverlay();
    if (voiceIt3ObjRef.type.biometricType === 'voice') {
      voiceIt3ObjRef.handleVoiceSetup();
    } else if (voiceIt3ObjRef.type.biometricType === 'face') {
      voiceIt3ObjRef.handleFaceSetup();
    } else {
      voiceIt3ObjRef.handleVideoSetup();
    }
  };

  //ready up animations and stuff for voice enroll/verific.
  voiceIt3ObjRef.handleVoiceSetup = function() {
    voiceIt3ObjRef.attempts = 0;
    voiceIt3ObjRef.initVoiceRecord();
    voiceIt3ObjRef.modal.show();
  };

  //ready up animations and stuff for face enroll/verific.
  voiceIt3ObjRef.handleFaceSetup = function() {
    voiceIt3ObjRef.initFaceRecord();
    voiceIt3ObjRef.attempts = 0;
    voiceIt3ObjRef.createVideo();
    voiceIt3ObjRef.createOverlay();
    voiceIt3ObjRef.modal.domRef.outerOverlay.style.opacity = 1.0;
    voiceIt3ObjRef.modal.show();
  };

  // Ready up animations and stuff for video enroll/verific.
  voiceIt3ObjRef.handleVideoSetup = function() {
    voiceIt3ObjRef.initVideoRecord();
    voiceIt3ObjRef.createOverlay();
    voiceIt3ObjRef.attempts = 0;
    voiceIt3ObjRef.createVideo();
    voiceIt3ObjRef.modal.domRef.outerOverlay.style.opacity = 1.0;
    voiceIt3ObjRef.modal.show();
  };

  voiceIt3ObjRef.createVideo = function() {
    let webcam = vi$.create('video');
    const imageScaleFactor = 0.5
    webcam.setAttribute('class', 'viVideo video-js vjs-default-skin');
    webcam.height = 480;
    webcam.width = 640;
    document.body.appendChild(webcam);
    voiceIt3ObjRef.viImageCanvasCtx = voiceIt3ObjRef.modal.domRef.imageCanvas.getContext('2d');
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
          voiceIt3ObjRef.videoStream = stream;
        }
      }
    ).catch(function(err) {
      console.log('index.js navigator.mediaDevices.getUserMedia Exception: ', err);
    });


  async function poseDetectionFrame() {

      // Mirror the video by drawing it onto the canvas
      voiceIt3ObjRef.viImageCanvasCtx.clearRect(0, 0, webcam.videoWidth, webcam.videoHeight);
      voiceIt3ObjRef.viImageCanvasCtx.save();
      voiceIt3ObjRef.viImageCanvasCtx.setTransform(-1.0, 0, 0, 1, webcam.videoWidth, 0);
      voiceIt3ObjRef.viImageCanvasCtx.drawImage(webcam, 0, 0, webcam.videoWidth, webcam.videoHeight);
      voiceIt3ObjRef.viImageCanvasCtx.restore();
      voiceIt3ObjRef.animationId = window.requestAnimationFrame(poseDetectionFrame);
    }
    poseDetectionFrame();
  };

  // Set up videoJS for voice
  voiceIt3ObjRef.initVoiceRecord = function() {
    var audio = vi$.create('audio');
    audio.setAttribute('id', 'myAudio');
    audio.setAttribute('class', 'video-js vjs-default-skin');
    document.body.appendChild(audio);
    voiceIt3ObjRef.player = videojs('myAudio', {
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
    voiceIt3ObjRef.setupListeners();
  };

  // Set up videoJS for video
  voiceIt3ObjRef.initVideoRecord = function() {
    var video = vi$.create('video');
    video.setAttribute('id', 'videoRecord');
    video.setAttribute('class', 'video-js vjs-default-skin');
    document.body.appendChild(video);
    voiceIt3ObjRef.player = videojs('videoRecord', {
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
    voiceIt3ObjRef.setupListeners();
  };

  // Set up videoJS for face
  voiceIt3ObjRef.initFaceRecord = function() {
    var video = vi$.create('video');
    video.setAttribute('id', 'videoRecord');
    video.setAttribute('class', 'video-js vjs-default-skin');
    document.body.appendChild(video);
    voiceIt3ObjRef.player = videojs('videoRecord', {
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
    voiceIt3ObjRef.setupListeners();
  };

  voiceIt3ObjRef.handleVerificationResponse = function(response){
    voiceIt3ObjRef.modal.removeWaitingLoader();
    if (response.responseCode === 'SUCC') {
      voiceIt3ObjRef.completionCallback(true, response);
      voiceIt3ObjRef.exitOut(true, response);
      voiceIt3ObjRef.displayAppropriateMessage(response);
    } else {
      voiceIt3ObjRef.attempts++;
      //continue to verify
      if (voiceIt3ObjRef.attempts > MAX_ATTEMPTS) {
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('MAX_ATTEMPTS'));
        voiceIt3ObjRef.completionCallback(false, response);
        voiceIt3ObjRef.exitOut(false, response);
      } else {
        voiceIt3ObjRef.displayAppropriateMessage(response);
        if(vi$.contains(ErrorCodes, response.responseCode)) {
          voiceIt3ObjRef.completionCallback(false, response);
            voiceIt3ObjRef.exitOut(false, response);
        } else {
            voiceIt3ObjRef.continueVerification(response);
        }

      }
    }
  };

  voiceIt3ObjRef.handleEnrollmentResponse = function(response){
    voiceIt3ObjRef.modal.removeWaitingLoader();
    // Handle enrollment success;
    if (response.responseCode === 'SUCC') {
      if (voiceIt3ObjRef.enrollCounter < 3) {
        voiceIt3ObjRef.enrollCounter++;
        voiceIt3ObjRef.continueEnrollment(response);
      }
    } else {
      voiceIt3ObjRef.attempts++;
      if (voiceIt3ObjRef.attempts > MAX_ATTEMPTS) {
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('MAX_ATTEMPTS'));
        voiceIt3ObjRef.completionCallback(false, response);
        voiceIt3ObjRef.exitOut(false, response);
      } else {
        voiceIt3ObjRef.continueEnrollment(response);
      }
    }
  };


  // One-time setup for the listeners to prevent duplicate api calls/records
  voiceIt3ObjRef.setupListeners = function() {

    voiceIt3ObjRef.player.on('ready', function() {
      voiceIt3ObjRef.player.record().getDevice();
    });

    voiceIt3ObjRef.player.on('deviceError', function() {
      //permission not granted
      //could'nt start recording device please try again.
      // remove ready button, show that 'permission not granted'
      voiceIt3ObjRef.modal.domRef.readyButton.style.display = 'none';
      voiceIt3ObjRef.modal.displayMessage('Recording permission not granted, please refresh and try again');
    });

    //called before deviceError above
    voiceIt3ObjRef.player.on('error', function(error) {
      console.log("index.js voiceIt3ObjRef.player.on('error') : ", error);
    });

    voiceIt3ObjRef.player.on('deviceReady', function() {
      //setup listners here
      if (voiceIt3ObjRef.type.action === 'Enrollment') {
        voiceIt3ObjRef.modal.showEnrollmentDeletionWarningOverlay();
      }
      voiceIt3ObjRef.initModalClickListeners();
      voiceIt3ObjRef.modal.domRef.readyButton.style.display = 'inline-block';
    });

    voiceIt3ObjRef.player.on('startRecord', function() {
    });

    voiceIt3ObjRef.player.on('finishRecord', function() {
      if (voiceIt3ObjRef.player.recordedData !== undefined) {
        //check the size of the file
        if (voiceIt3ObjRef.player.recordedData.size > 0){
          voiceIt3ObjRef.player.recordedData = voiceIt3ObjRef.player.recordedData;
          voiceIt3ObjRef.handleFinishRecording();
        } else {
          //re check the size of the file after 200ms
          setTimeout(()=>{
            if (voiceIt3ObjRef.player.recordedData.size > 0){
              voiceIt3ObjRef.player.recordedData = voiceIt3ObjRef.player.recordedData;
              voiceIt3ObjRef.handleFinishRecording();
            } else {
              //show error and return
              voiceIt3ObjRef.modal.removeWaitingLoader();
              voiceIt3ObjRef.modal.displayMessage('Recording error occurred, please try again');
            }
          },200);
        }
      } else {
        //show error message
        voiceIt3ObjRef.modal.removeWaitingLoader();
        voiceIt3ObjRef.modal.displayMessage('Recording error occurred, please try again');
        return;
      }
    });
  };

  voiceIt3ObjRef.handleFinishRecording = function(){
      vi$.fadeIn(voiceIt3ObjRef.modal.domRef.outerOverlay, 300, null, 0.3);
      voiceIt3ObjRef.modal.showWaitingLoader(true);

      if(
        voiceIt3ObjRef.type.biometricType === 'voice' &&
        voiceIt3ObjRef.type.action === 'Verification'
      ){
        voiceIt3ObjRef.apiRef.voiceVerification({
          viContentLanguage: voiceIt3ObjRef.contentLanguage,
          viPhrase: voiceIt3ObjRef.phrase,
          viVoiceData : voiceIt3ObjRef.player.recordedData
        }, function(response){
          voiceIt3ObjRef.handleVerificationResponse(response);
        });
      }

      if(
        voiceIt3ObjRef.type.biometricType === 'face' &&
        voiceIt3ObjRef.type.action === 'Verification'
      ){
          voiceIt3ObjRef.apiRef.faceVerification({
            viVideoData : voiceIt3ObjRef.player.recordedData
          }, function(response){
            voiceIt3ObjRef.handleVerificationResponse(response);
        });
      }

      if(
        voiceIt3ObjRef.type.biometricType === 'video' &&
        voiceIt3ObjRef.type.action === 'Verification'
      ){
        voiceIt3ObjRef.apiRef.videoVerification({
          viContentLanguage: voiceIt3ObjRef.contentLanguage,
          viPhrase: voiceIt3ObjRef.phrase,
          viVideoData : voiceIt3ObjRef.player.recordedData
        }, function(response){
          voiceIt3ObjRef.handleVerificationResponse(response);
        });
      }

      if(voiceIt3ObjRef.type.biometricType === 'voice' && voiceIt3ObjRef.type.action === 'Enrollment'){
        voiceIt3ObjRef.apiRef.createVoiceEnrollment({
          viContentLanguage: voiceIt3ObjRef.contentLanguage,
          viPhrase: voiceIt3ObjRef.phrase,
          viVoiceData : voiceIt3ObjRef.player.recordedData
        }, function(response){
          voiceIt3ObjRef.handleEnrollmentResponse(response);
        });
      }

      if(voiceIt3ObjRef.type.biometricType === 'face' && voiceIt3ObjRef.type.action === 'Enrollment'){
        voiceIt3ObjRef.apiRef.createFaceEnrollment({
          viVideoData : voiceIt3ObjRef.player.recordedData
        }, function(response){
          voiceIt3ObjRef.handleEnrollmentResponse(response);
        });
      }

      if(voiceIt3ObjRef.type.biometricType === 'video' && voiceIt3ObjRef.type.action === 'Enrollment'){
        voiceIt3ObjRef.apiRef.createVideoEnrollment({
          viContentLanguage: voiceIt3ObjRef.contentLanguage,
          viPhrase: voiceIt3ObjRef.phrase,
          viVideoData : voiceIt3ObjRef.player.recordedData
        }, function(response){
          voiceIt3ObjRef.handleEnrollmentResponse(response);
        });
      }
}

  ///REFACTOR
  voiceIt3ObjRef.startView = function() {
    if (voiceIt3ObjRef.type.action === 'Verification' && voiceIt3ObjRef.type.biometricType === 'voice') {
      voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('VERIFY'));
      voiceIt3ObjRef.modal.revealWaveform(500);
    }

      if (voiceIt3ObjRef.type.biometricType === 'face') {
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('LOOK_INTO_CAM'));
        voiceIt3ObjRef.modal.createProgressCircle(3200);
        voiceIt3ObjRef.modal.revealProgressCircle();
      } else if (voiceIt3ObjRef.type.biometricType === 'video') {
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('VERIFY'));
          voiceIt3ObjRef.modal.revealWaveform(500);
          voiceIt3ObjRef.modal.createVideoCircle();
          voiceIt3ObjRef.modal.createProgressCircle(5200);
          voiceIt3ObjRef.modal.domRef.progressCircle.style.display = 'block';
          voiceIt3ObjRef.modal.revealProgressCircle();
      } else if (voiceIt3ObjRef.type.biometricType === 'voice'){
          voiceIt3ObjRef.modal.revealWaveform(500);
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('VERIFY'));
      }

      // if (voiceIt3ObjRef.type.biometricType === 'voice') {
      //   voiceIt3ObjRef.modal.revealWaveform(500);
      // } else if (voiceIt3ObjRef.type.biometricType === 'face') {
      //   voiceIt3ObjRef.modal.createProgressCircle(3200);
      //   voiceIt3ObjRef.modal.revealProgressCircle();
      // } else if (voiceIt3ObjRef.type.biometricType === 'video') {
      //   voiceIt3ObjRef.modal.createVideoCircle();
      //   voiceIt3ObjRef.modal.createProgressCircle(5200);
      //   voiceIt3ObjRef.modal.domRef.progressCircle.style.display = 'block';
      //   voiceIt3ObjRef.modal.revealProgressCircle();
      // }

    vi$.fadeOut(voiceIt3ObjRef.modal.domRef.outerOverlay, 1500, null, 0.3);
    voiceIt3ObjRef.modal.domRef.readyButton.style.display = 'none';
    if(voiceIt3ObjRef.player) {
      voiceIt3ObjRef.player.record().start();
    }
  };

  voiceIt3ObjRef.continueEnrollment = function(response) {
    // Handle the response (can use displayAppropriateMessage() method- will see it later on)
    if (voiceIt3ObjRef.type.biometricType !== 'face') {
      if (response.responseCode === 'SUCC') {
        // TODO: Refactor getting prompts based on counter
        if (voiceIt3ObjRef.enrollCounter === 1) {
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_1'));
        } else if (voiceIt3ObjRef.enrollCounter === 2) {
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_2'));
        } else if (voiceIt3ObjRef.enrollCounter === 3) {
          if (voiceIt3ObjRef.type.biometricType === 'voice') {
            voiceIt3ObjRef.enrollmentNeededVoice = false;
          } else {
            voiceIt3ObjRef.enrollmentNeededVideo = false;
          }
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_3'));
          voiceIt3ObjRef.completionCallback(true, response);
          voiceIt3ObjRef.exitOut(true, response);
        }
      } else {
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt(response.responseCode));
      }
        voiceIt3ObjRef.modal.removeWaitingLoader();

    } else if (voiceIt3ObjRef.type.biometricType === 'face') {
      if (response.responseCode === 'SUCC') {
        // voiceIt3ObjRef.enrollmentNeededFace = false;
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('SUCC_ENROLLMENT_3'));
        voiceIt3ObjRef.completionCallback(true, response);
        voiceIt3ObjRef.exitOut(true, response);
      }
      //handle re-recording and animations for face
      else {
        setTimeout(function() {
          voiceIt3ObjRef.modal.hideProgressCircle(350);
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('LOOK_INTO_CAM'));
          voiceIt3ObjRef.modal.createProgressCircle(5200);
          voiceIt3ObjRef.modal.revealProgressCircle(350);
          vi$.fadeOut(voiceIt3ObjRef.modal.domRef.outerOverlay, 500, function(){
            voiceIt3ObjRef.player.record().start();
          });
        }, 2000);
        voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt(response.responseCode));
      }
  }

    // Handle re-recording and prompts/animations along with it (for voice/video)
    if (voiceIt3ObjRef.enrollCounter < 3 && voiceIt3ObjRef.type.biometricType !== 'face') {
      setTimeout(function() {
        voiceIt3ObjRef.modal.hideProgressCircle(350);
        if (voiceIt3ObjRef.enrollCounter >= 0) {
            voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('ENROLL_' + voiceIt3ObjRef.enrollCounter));
        }

        if (voiceIt3ObjRef.type.biometricType === 'video') {
          vi$.fadeOut(voiceIt3ObjRef.modal.domRef.outerOverlay, 500, function(){
            voiceIt3ObjRef.player.record().start();
          });
        }

        if (voiceIt3ObjRef.type.biometricType === 'voice') {
          voiceIt3ObjRef.modal.hideProgressCircle();
          voiceIt3ObjRef.player.record().start();
        } else {
            voiceIt3ObjRef.modal.hideProgressCircle(350);
            if (voiceIt3ObjRef.type.biometricType === 'face'){
              voiceIt3ObjRef.modal.createProgressCircle(3200);
            } else {
            voiceIt3ObjRef.modal.createProgressCircle(5200);
            }
            voiceIt3ObjRef.modal.revealProgressCircle(350);
        }
      }, 2000);
    }
  };

  //continue verification if errors, response codes, etc
  voiceIt3ObjRef.continueVerification = function() {
    if(voiceIt3ObjRef.destroyed){ return ;}
    setTimeout(function() {
      voiceIt3ObjRef.modal.hideProgressCircle(350);
      if (voiceIt3ObjRef.type.biometricType === 'face') {
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('LOOK_INTO_CAM'));
      } else {
          voiceIt3ObjRef.modal.displayMessage(voiceIt3ObjRef.prompts.getPrompt('VERIFY'));
      }
      if (voiceIt3ObjRef.type.biometricType === 'voice') {
        voiceIt3ObjRef.modal.revealWaveform(500, function() {
          voiceIt3ObjRef.player.record().start();
        });
      } else {
        voiceIt3ObjRef.modal.hideProgressCircle(350);
        vi$.fadeOut(voiceIt3ObjRef.modal.domRef.outerOverlay, 500, function(){
          if(voiceIt3ObjRef.player){
            voiceIt3ObjRef.player.record().start();
          }
          voiceIt3ObjRef.modal.revealProgressCircle(350);
          if (voiceIt3ObjRef.type.biometricType === 'face'){
            voiceIt3ObjRef.modal.createProgressCircle(3200);
          } else {
          voiceIt3ObjRef.modal.createProgressCircle(5200);
          }
        });
      }
    }, 2000);
  };



  voiceIt3ObjRef.showLoadingOverlay = function() {
    if (voiceIt3ObjRef.type.action !== 'Enrollment') {
      if(voiceIt3ObjRef.type.biometricType === 'voice'){
        voiceIt3ObjRef.modal.createWaveform();
      } else {
        voiceIt3ObjRef.modal.domRef.imageCanvas.style.opacity = '1.0';
      }
      voiceIt3ObjRef.modal.domRef.readyButton.style.display = 'inline-block';
      voiceIt3ObjRef.modal.domRef.readyButton.style.opacity = '1.0';
    }
  };

  // Exit the modal post completion of task
  voiceIt3ObjRef.exitOut = function (success, response){
    if (!voiceIt3ObjRef.destroyed){
      vi$.delay(TIME_BEFORE_EXITING_MODAL_AFTER_SUCCESS, function(){
        vi$.fadeOut(voiceIt3ObjRef.modal.domRef.modalDimBackground, 1100, function(){
              voiceIt3ObjRef.destroy();
              voiceIt3ObjRef.modal.hide();
        });
      });
    }
  };

  // Destroy video, canvas, and other objects
  voiceIt3ObjRef.destroy = function(destroyFinished) {
    window.cancelAnimationFrame(voiceIt3ObjRef.animationId);
    voiceIt3ObjRef.isInitiated = false;
    vi$.remove('#viVideo');
    if (voiceIt3ObjRef.type.biometricType !== 'voice') {
      vi$.remove(voiceIt3ObjRef.modal.domRef.imageCanvas);
    }

    if (voiceIt3ObjRef.videoStream !== undefined) {
      voiceIt3ObjRef.videoStream.getTracks()[0].stop();
      voiceIt3ObjRef.videoStream = undefined;
    }

    if (voiceIt3ObjRef.player !== undefined) {
      voiceIt3ObjRef.player.off('finishRecord', function(){

      });
      voiceIt3ObjRef.player.record().destroy();
      voiceIt3ObjRef.player = undefined;
    }

    if (voiceIt3ObjRef.modal.domRef.readyButton) {
       voiceIt3ObjRef.modal.domRef.readyButton.style.display = 'none';
    }

    if (voiceIt3ObjRef.type.biometricType !== 'voice') {
      if(voiceIt3ObjRef.modal.domRef.imageCanvas){
        var ctx = voiceIt3ObjRef.modal.domRef.imageCanvas.getContext('2d');
        ctx.clearRect(0, 0, voiceIt3ObjRef.modal.domRef.imageCanvas.width, voiceIt3ObjRef.modal.domRef.imageCanvas.height);
      }
    }

    voiceIt3ObjRef.modal.destroy();
    voiceIt3ObjRef.destroyed = true;
    if(destroyFinished){ destroyFinished();}
  };

  voiceIt3ObjRef.createOverlay = function() {
    var ctx2 = voiceIt3ObjRef.modal.domRef.overlayCanvas;
    var context2 = ctx2.getContext('2d');
    context2.beginPath();
    context2.arc(230, 148, 131, 0, 2 * Math.PI);
    context2.rect(460, 0, -460, 345);
    context2.fillStyle = 'rgba(0,0,0,1.0)';
    context2.fill('evenodd');
  };

  return this;
};
