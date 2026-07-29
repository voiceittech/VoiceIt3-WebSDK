import vi$ from './utilities';
import Prompts from './prompts';
import ProgressBar from 'progressbar.js';
import LoadingCircle from './vectors/loadingCircle.svg';
import PoweredByBadge from './vectors/voiceit-powered-by-one-default.svg'
import Colors from './colors';

export default function Modal(mRef, language) {
  const VoiceItModalRef = this;
  // Liveness challenges removed in API 3.0
  const prompts = new Prompts(language);
  //stores the JS DOM Elements as value to the name, which is 'elName'
  //https://www.w3schools.com/js/js_htmldom_elements.asp
  VoiceItModalRef.domRef = {};
  VoiceItModalRef.mainRef = mRef;
  // Array to keep track of cleanup functions
  VoiceItModalRef.cleanupFunctions = [];
  //each object in this array has the following keys
  //nodeName: the type of html node
  //parent: the parent element to append
  //styles: the css styles
  //attributes: the html attributes for the element
  //elName: the name

  //the order of the objects is from parent => left child in html tree.
  //it's a BFS traversal of the tree
  VoiceItModalRef.modalElementTree = [
    {
        'nodeName': 'div',
        'parent': 'body',
        'elName': 'modalDimBackground'
    },
    {
      'styles':{
        'display' : 'block !important',
        'max-width': '460px',
        'min-width': '460px',
        'overflow': 'hidden',
        'marginBottom': '8%',
        'background': 'transparent'
      },
      'attributes': {
        'class': 'ui modal viModal'
      },
      'elName': 'voiceItModal',
      'nodeName': 'div',
      'parent': 'modalDimBackground'
    },
    {
      'attributes': {
        'class': 'close icon'
      },
      'styles': {
        'top': '1rem',
        'right': '1rem',
        'color': '#0A0A0A',
        'fontSize': '25px'
      },
      'nodeName': 'i',
      'elName' : 'closeButton',
      'parent': 'voiceItModal'
    }, {
      'styles':{
        'zIndex': '-2'
      },
      'attributes': {
        'class': 'ui card'
      },
      'elName':'viCard',
      'nodeName': 'div',
      'parent': 'voiceItModal'
    }, {
      'attributes': {
        'class': 'image',
      },
      'elName':'cardOverlay',
      'nodeName': 'div',
      'parent': 'viCard'
    },{
      'styles':{
        'bottom': '3.5em',
        'zIndex': '6',
        'position': 'relative',
        'padding': '0px',
        'backgroundColor': '#FFFFFF',
        'textAlign': 'center'
      },
      'attributes': {
        'class': 'content'
      },
      'elName':'content',
      'nodeName': 'div',
      'parent': 'viCard'
    }, {
      'styles':{
        'backgroundColor': '#FFFFFF'
      },
      'attributes': {
        'class': 'extra content'
      },
      'nodeName': 'div',
      'elName':'modalExtraContent',
      'parent': 'viCard'
    },
    {
      'attributes': {
        'href':'https://voiceit.io',
        'target':'_blank'
      },
      'elName': 'poweredByLink',
      'nodeName': 'a',
      'parent': 'modalExtraContent'
    },
    {
      'styles':{
        'display': 'none',
        'width': '100%',
        'height': '345px',
        'position': 'absolute',
        'zIndex': '26',
        'background': '#FFFFFF',
        'textAlign': 'center',
        'alignItems': 'center',
        'justifyContent': 'center',
        'flexWrap': 'wrap',
        'alignContent': 'center'
      },
      'nodeName': 'div',
      'elName':'warningOverlay',
      'parent': 'cardOverlay'
    },{
      'styles':{
        'display': 'none',
        'width': '100%',
        'height': '345px',
        'position': 'absolute',
        'zIndex': '26',
        'background': '#FFFFFF',
        'textAlign': 'center',
        'alignItems': 'center',
        'justifyContent': 'center',
        'flexWrap': 'wrap',
        'alignContent': 'center'
      },
      'nodeName': 'div',
      'parent': 'cardOverlay'
    },{
      'styles':{
        // 'overflow': 'hidden',
        'position': 'relative',
        'justifyContent': 'center',
        'display': 'flex',
        'minHeight': '365px',
        'width': '100%'
      },
      'nodeName': 'div',
      'elName':'overlayHolder',
      'parent': 'cardOverlay'
    }, {
      'attributes': {
        'id': 'videoLiveness',
        'autoplay': '',
        'playsinline': ''
      },
      'nodeName': 'video',
      'parent': 'cardOverlay',
      'type' : 'video/webm',
    }, {
      'attributes': { 'class': 'viStepDots' },
      'nodeName': 'div', 'elName': 'stepDots', 'parent': 'content'
    }, {
      'attributes': { 'class': 'viStepDot active' },
      'nodeName': 'div', 'elName': 'stepDot0', 'parent': 'stepDots', 'text': '1'
    }, {
      'attributes': { 'class': 'viStepDot' },
      'nodeName': 'div', 'elName': 'stepDot1', 'parent': 'stepDots', 'text': '2'
    }, {
      'attributes': { 'class': 'viStepDot' },
      'nodeName': 'div', 'elName': 'stepDot2', 'parent': 'stepDots', 'text': '3'
    }, {
      'styles':{
        'color': '#2ECC71',
        'height': '2em'
      },
      'attributes':{
        'class':'ui header'
      },
      'elName': 'headerLink',
      'nodeName': 'a',
      'parent': 'content'
    }, {
      'attributes': {
        'id': 'powered-by',
        'src': PoweredByBadge
      },
      'nodeName': 'img',
      'parent': 'poweredByLink'
    },
    {
      'styles':{
        'color': 'white',
        'fontStyle': 'normal',
        'paddingTop':'5rem',
        'paddingLeft': '10px',
        'paddingRight': '10px',
        'fontSize': 'large',
        'width':'100%',
        'fontWeight': '300'
      },
      'attributes': {
        'class': 'ui header'
      },
      'elName':'warnText',
      'nodeName': 'span',
      'parent': 'warningOverlay',
      'text': prompts.getPrompt('REENROLLMENT_WARNING')
    }, {
      'nodeName': 'div',
      'elName': 'iconHolder',
      'parent': 'warningOverlay'
    },
    // Removed: an orphaned <h4> and a dead "Skip"/"Omitir" <a> button (leftovers
    // from the removed liveness UI). Neither declared a 'parent', so buildModal's
    // parent.appendChild(ele) threw "Cannot read properties of undefined
    // (reading 'appendChild')", aborting the whole modal build (record button
    // never created, modal never shown). See the parent guard in buildModal.
    {
      'styles':{
        'display': 'flex',
        'position': 'absolute',
        'minHeight': '345px',
        'width': '100%',
        'zIndex': '1',
        'background': 'rgba(0,0,0,0.5)'
      },
      'nodeName': 'div',
      'elName':'outerOverlay',
      'parent': 'overlayHolder'
    }, {
      'styles':{
        'position': 'absolute',
        'top': '6%',
        'zIndex' : '2'
      },
      'attributes': {
        'width': '460',
        'height': '345',
        'class': 'viCanvas'
      },
      'nodeName': 'canvas',
      'elName' : 'overlayCanvas',
      'parent': 'overlayHolder'
    }, {
      'attributes': {
        'class': 'small ui inverted basic button viReadyButton'
      },
      'styles': {
        'position': 'absolute',
        'bottom': '0%',
        'zIndex': '8',
        'margin': 'auto',
        'fontWeight' :'600'
      },
      'nodeName': 'button',
      'elName': 'readyButton',
      'parent': 'overlayHolder',
      'text': language === 'es-ES' ? 'Comenzar' : 'Click to begin'
      }, {
      'styles':{
        'top': '6%',
        'width': '100%',
        'position': 'absolute',
        'opacity':'0.0'
      },
      'attributes': {
        'class':'viImageCanvas',
        'height': '480',
        'width': '640'
      },
      'elName': 'imageCanvas',
      'nodeName': 'canvas',
      'parent': 'overlayHolder'
    },{
      'styles':{
        'fontStyle': 'normal',
        'maxWidth': '300px',
        'color': '#0A0A0A'
      },
      'elName':'viMessage',
      'nodeName': 'span',
      'parent': 'headerLink'
    },
    {
      'attributes': {
        'class': 'ic icon arrow circle left arrowButton'
      },
      'elName':'leftArrowIcon',
      'nodeName': 'i',
      'parent': 'iconHolder'
    }, {
      'attributes': {
        'class': 'ic icons icon arrow circle right arrowButton'
      },
      'elName': 'rightArrowIcon',
      'nodeName': 'i',
      'parent': 'iconHolder'
    }, {
      'attributes': {
        'class': 'chevron circle right icon'
      },
      'elName':'readyArrow',
      'nodeName': 'i',
      'parent': 'readyButton'
    }
  ];

  VoiceItModalRef.svgElements = ['svg', 'g', 'mask', 'circle', 'rect'];

  VoiceItModalRef.getmodalElementTree = function() {
    return VoiceItModalRef.modalElementTree;
  }

  VoiceItModalRef.buildModal = function() {
    var svgns = 'http://www.w3.org/2000/svg';
    VoiceItModalRef.modalElementTree.forEach(function(modalPart) {
      var ele;
      //  Svg elements require creation under different namespace
      if (VoiceItModalRef.svgElements.indexOf(modalPart.nodeName) > -1) {
        ele = document.createElementNS(svgns, modalPart.nodeName);
        var parent = vi$.qs(modalPart.parent);
        if(!parent){ parent = VoiceItModalRef.domRef[modalPart.parent]; }
        if(!parent){ console.warn('VoiceIt modal: skipping "' + modalPart.nodeName + '" — parent "' + modalPart.parent + '" not found'); return; }
        parent.appendChild(ele);
      }
      //if not svg element
      else {
        ele = document.createElement(modalPart.nodeName);
        //find parent by query selector
        //added specifically to find elements that might not be in domRef, such as <body> and <video> to accomodate the first case
        // REFACTOR
        var parent = vi$.qs(modalPart.parent);
        //otherwise, find parent from domRef
        //the parent will ALWAYS be in the domRef because the modal tree has elements in it sequentially
        //the parents always preceede the children
        if(parent == undefined){
          parent = VoiceItModalRef.domRef[modalPart.parent];
        }
        if(parent == undefined){ console.warn('VoiceIt modal: skipping "' + modalPart.nodeName + '" — parent "' + modalPart.parent + '" not found'); return; }
        //append element as last child to parent
        parent.appendChild(ele);
        if (modalPart.text) {
          ele.textContent = modalPart.text;
        }
      }
      //add into domRef. Doesn't happen for query selector compatible elements, such as 'body'
      if(modalPart['elName']){
        VoiceItModalRef.domRef[modalPart['elName']] = ele;
      }
      //add attributes to the element
      for (var property in modalPart.attributes) {
        ele.setAttribute(property, modalPart.attributes[property]);
      }
      //add styles to element
      for (var property in modalPart.styles) {
        ele.style[property] = modalPart.styles[property];
      }
    });
  }

  VoiceItModalRef.show = function(){
    VoiceItModalRef.domRef.modalDimBackground.className = 'ui dimmer modals page transition visible active';
    VoiceItModalRef.domRef.voiceItModal.className = 'viModal ui modal transition visible active';
  }

  VoiceItModalRef.hide = function(){
    VoiceItModalRef.domRef.modalDimBackground.className = '';
    VoiceItModalRef.domRef.voiceItModal.className = 'viModal ui modal';
    VoiceItModalRef.domRef.modalDimBackground.style.opacity = 1.0;
    VoiceItModalRef.domRef.voiceItModal.style.opacity = 1.0;
  }

  VoiceItModalRef.build = function() {
    VoiceItModalRef.destroy();
    VoiceItModalRef.buildModal();
  }

  // Circle Helper Methods
  VoiceItModalRef.hideProgressCircle = function(duration, after){
    if(!VoiceItModalRef.domRef.progressCircle){ return; }
    if(duration){
      vi$.fadeOut(VoiceItModalRef.domRef.progressCircle, duration, after);
    } else {
      VoiceItModalRef.domRef.progressCircle.style.opacity = 0.0;
    }
  }

  VoiceItModalRef.revealProgressCircle = function(duration, after){
    if(!VoiceItModalRef.domRef.progressCircle){ return; }
    if(duration){
      vi$.fadeIn(VoiceItModalRef.domRef.progressCircle, duration, after);
    } else {
      VoiceItModalRef.domRef.progressCircle.style.opacity = 1.0;
    }
  }

  VoiceItModalRef.createProgressCircle = function(animationDuration){
    if(VoiceItModalRef.domRef.progressCircle){
      vi$.remove(VoiceItModalRef.domRef.progressCircle);
    }
    VoiceItModalRef.domRef.progressCircle = vi$.create('div');
    var progressCircleProps = {
      'styles':{
        'zIndex': '12',
        'top': '10.5%',
        'position': 'absolute',
        'width': '271px',
        'height': '271px',
        'left': '21%'
      },
      'attributes':{
        'class':'viProgressCircle'
      },
    };
    for (var prop in progressCircleProps.attributes) {
      VoiceItModalRef.domRef.progressCircle.setAttribute(prop, progressCircleProps.attributes[prop]);
    }
    for (var prop in progressCircleProps.styles) {
      VoiceItModalRef.domRef.progressCircle.style[prop] = progressCircleProps.styles[prop];
    }
    VoiceItModalRef.domRef.overlayHolder.insertBefore(VoiceItModalRef.domRef.progressCircle, VoiceItModalRef.domRef.imageCanvas);
    vi$.createProgressCircle(VoiceItModalRef.domRef.progressCircle, animationDuration);
  }

  VoiceItModalRef.updateProgressCircle = function(circleId, value, color){
  }

  // Create audio prompts for face verification
  VoiceItModalRef.createAudioPrompts = function() {
    if(VoiceItModalRef.domRef.audioPrompts){
      vi$.remove(VoiceItModalRef.domRef.audioPrompts)
    }
    VoiceItModalRef.domRef.audioPrompts = vi$.create('AUDIO');
    // const filePath = 'wav/' + fileName + '.wav';
    var audioPromptsProps = {
      'attributes':{
        'height':'500px',
        'width' :'500px',
        'class' :'audioPrompts',
        'id' : 'audioPrompt',
        'autoplay' : 'true',
      }
    };
    let sourceElem = vi$.create('SOURCE');
    sourceElem.setAttribute('id', 'audioSrc');
    for (var prop in audioPromptsProps.attributes) {
      VoiceItModalRef.domRef.audioPrompts.setAttribute(prop, audioPromptsProps.attributes[prop]);
    }
    VoiceItModalRef.domRef.audioPrompts.appendChild(sourceElem)
    VoiceItModalRef.domRef.viCard.insertBefore(VoiceItModalRef.domRef.audioPrompts, VoiceItModalRef.domRef.content);

  }

  // Create the Audio waveform
  VoiceItModalRef.createWaveform = function() {
    if(VoiceItModalRef.domRef.waveform){
      vi$.remove(VoiceItModalRef.domRef.waveform);
    }
    VoiceItModalRef.domRef.waveform = vi$.create('canvas');
    var waveProps = {
      'styles':{
        'position': 'absolute',
        'top': '15%',
        'right': '0',
        'bottom': '0',
        'zIndex': '2',
        'backgroundColor': 'black',
        'opacity': '0.3'
      },
      'attributes':{
        'height':'242',
        'width' :'460',
        'class' :'viWaveform'
      }
    };
    for (var prop in waveProps.attributes) {
      VoiceItModalRef.domRef.waveform.setAttribute(prop, waveProps.attributes[prop]);
    }
    for (var prop in waveProps.styles) {
      VoiceItModalRef.domRef.waveform.style[prop] = waveProps.styles[prop];
    }
    // Creates the Waveform for Voice Enrollment and Verification
    VoiceItModalRef.domRef.viCard.insertBefore(VoiceItModalRef.domRef.waveform, VoiceItModalRef.domRef.content);
    var colors = [Colors.MAIN_THEME_COLOR, Colors.MAIN_THEME_COLOR, Colors.MAIN_THEME_COLOR, Colors.MAIN_THEME_COLOR];
    var waveContext = VoiceItModalRef.domRef.waveform.getContext('2d');
    var waveStartTime = new Date().getTime();

    function getPath(height) {
      var width = VoiceItModalRef.domRef.waveform.width;
      var spacing = 0.08;
      var loopNum = 0;
      var pointList = [];
      var i = 0;

      for (i = 0; i < width / 2; i++) {
      pointList[loopNum] = [loopNum, Math.sin(loopNum * spacing) * (i * height) + 100];
      loopNum++;
      }
      for (i = width / 2; i > 0; i--) {
      pointList[loopNum] = [loopNum, Math.sin(loopNum * spacing) * (i * height) + 100];
      loopNum++;
      }
      return pointList;
    }

    var analyser, amp, animationId;
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    }).then(function(stream) {

        var context = new AudioContext();
        analyser = context.createAnalyser();
        context.createMediaStreamSource(stream).connect(analyser);
        amp = new Uint8Array(analyser.frequencyBinCount);
        VoiceItModalRef.videoCircleStream = stream;
        var waveRunning = false;

        function setWaveAmp() {
          analyser.getByteFrequencyData(amp);
          const RMS = vi$.getRMS(amp);
          var currentAmp = 0.25 * RMS / 50;
          currentAmp = currentAmp > 0.25 ? 0.25 : currentAmp;
          currentAmp = currentAmp < 0.1 ? 0.0 : currentAmp;
          var currentTime = new Date().getTime();
          var runTime = currentTime - waveStartTime;

          waveContext.clearRect(0, 0, VoiceItModalRef.domRef.waveform.width, VoiceItModalRef.domRef.waveform.height);
          waveContext.beginPath();
          waveContext.lineWidth = 2.0;
          waveContext.strokeStyle = Colors.MAIN_THEME_COLOR;

          var height = Math.sin(runTime * 0.006) * currentAmp;
          var pointList = getPath(height);

          for (var i = 0; i < VoiceItModalRef.domRef.waveform.width; i++) {
            if (i === 0) {
              waveContext.moveTo(pointList[0][0], pointList[0][1]);
            } else {
              waveContext.lineTo(pointList[i][0], pointList[i][1]);
            }
          }
          waveContext.stroke();
          animationId = window.requestAnimationFrame(setWaveAmp);
        }

        animationId = window.requestAnimationFrame(setWaveAmp);
        // Add animation to cleanup array
        VoiceItModalRef.cleanupFunctions.push(function(){
          window.cancelAnimationFrame(animationId);
        });
    }).catch(function(err) {
        console.log('modal.js getPath navigator.mediaDevices.getUserMedia Exception: ', err);
    });


  }

  VoiceItModalRef.revealWaveform = function(duration, after){
    if(!VoiceItModalRef.domRef.waveform){ return; }
    if(duration){
      vi$.fadeIn(VoiceItModalRef.domRef.waveform, duration, after);
    } else {
      VoiceItModalRef.domRef.waveform.style.opacity = 1.0;
    }
  }

  // Header Helper Methods
  VoiceItModalRef.hideWarningOverlay = function(duration, after){
    if(!VoiceItModalRef.domRef.warningOverlay){ return; }
    if(duration){
      var tempAfter = function(){
        VoiceItModalRef.domRef.warningOverlay.style.display = 'none';
        vi$.remove(VoiceItModalRef.domRef.warningOverlay);
        if(after){ VoiceItModalRef.removeWaitingLoader(); after(); }
      }
      vi$.fadeOut(VoiceItModalRef.domRef.warningOverlay, duration, tempAfter);
    } else {
      VoiceItModalRef.domRef.warningOverlay.style.opacity = 0.0;
      VoiceItModalRef.domRef.warningOverlay.style.display = 'none';
      vi$.remove(VoiceItModalRef.domRef.warningOverlay);
    }
  }


  VoiceItModalRef.revealWarningOverlay = function(duration, after){
    if(!VoiceItModalRef.domRef.warningOverlay){ return; }
    if(duration){
      VoiceItModalRef.domRef.warningOverlay.style.display = 'inline-flex';
      vi$.fadeIn(VoiceItModalRef.domRef.warningOverlay, duration, after);
    } else {
      VoiceItModalRef.domRef.warningOverlay.style.opacity = 1.0;
      VoiceItModalRef.domRef.warningOverlay.style.display = 'inline-flex';
    }
  }

  VoiceItModalRef.displayMessage = function(textToSet){
    if(!VoiceItModalRef.domRef.viMessage){ return; }
    VoiceItModalRef.domRef.viMessage.innerHTML = textToSet;
    VoiceItModalRef.domRef.viMessage.style.opacity = 1.0;
    VoiceItModalRef.domRef.viMessage.style.display = 'inline-block';
  }

  // Step dots (1·2·3) under the video — mirrors the voiceit.io/demo enroll UI.
  VoiceItModalRef.showStepDots = function(){
    if(VoiceItModalRef.domRef.stepDots){ VoiceItModalRef.domRef.stepDots.style.display = 'flex'; }
  }
  VoiceItModalRef.hideStepDots = function(){
    if(VoiceItModalRef.domRef.stepDots){ VoiceItModalRef.domRef.stepDots.style.display = 'none'; }
  }
  VoiceItModalRef.setStepDot = function(activeIndex){
    for(var i=0;i<3;i++){
      var d = VoiceItModalRef.domRef['stepDot'+i];
      if(d){ d.className = 'viStepDot' + (i === activeIndex ? ' active' : ''); }
    }
  }

  VoiceItModalRef.showWaitingLoader = function(down) {
    if(VoiceItModalRef.domRef.waitingLoader){
      vi$.remove(VoiceItModalRef.domRef.waitingLoader);
    }
    if(VoiceItModalRef.domRef.viMessage){
      VoiceItModalRef.domRef.viMessage.style.opacity = 0.0;
      VoiceItModalRef.domRef.viMessage.style.display = 'none';
    }
    VoiceItModalRef.domRef.waitingLoader = vi$.create('div');
    VoiceItModalRef.domRef.waitingLoader.style.display = 'flex';
    VoiceItModalRef.domRef.waitingLoader.style.justifyContent = 'center';
    var waitingLoaderImg = vi$.create('img');
    VoiceItModalRef.domRef.waitingLoader.appendChild(waitingLoaderImg);
    var waitingLoaderProps = {
      'styles':{
        'display':'flex !important',
        'top': down ? '88%': '44%',
        'position': 'absolute',
        'zIndex': '18',
        'maxHeight': '4rem'
      },
      'attributes': {
        'class': 'svg',
        'src': LoadingCircle
      }
    };
    for (var prop in waitingLoaderProps.attributes) {
      waitingLoaderImg.setAttribute(prop, waitingLoaderProps.attributes[prop]);
    }
    for (var prop in waitingLoaderProps.styles) {
      waitingLoaderImg.style[prop] = waitingLoaderProps.styles[prop];
    }
    VoiceItModalRef.domRef.overlayHolder.insertBefore(VoiceItModalRef.domRef.waitingLoader, VoiceItModalRef.domRef.firstChild);
    var overflowParent = document.getElementsByClassName('image')[0];
    if (overflowParent && overflowParent.children[1]) {
      overflowParent = overflowParent.children[1];
      overflowParent.style.overflow = '';
      var checkingText = document.createElement('div');
      checkingText.textContent = 'Checking';
      checkingText.id = 'checkingText';
      checkingText.setAttribute('style', 'top: 101%; margin: auto; color: white; position: absolute; font-size: 1rem;');
      if (overflowParent.children[3]) {
        overflowParent.children[3].appendChild(checkingText);
      }
    }
  }

  VoiceItModalRef.removeWaitingLoader = function(){
      if(VoiceItModalRef.domRef.waitingLoader){
        vi$.remove(VoiceItModalRef.domRef.waitingLoader);
      }
  }

  // Creates the circular audio waveform around video (verification/enrollment)
  VoiceItModalRef.createVideoCircle = function() {
    if(VoiceItModalRef.domRef.videoCircle){
      vi$.remove(VoiceItModalRef.domRef.videoCircle);
    }
    var videoCircleRadius = 130;
    var svgNS = 'http://www.w3.org/2000/svg';
    VoiceItModalRef.domRef.videoCircle = document.createElementNS(svgNS, 'svg');
    var vidCircleProps = {
        'styles':{
          'right': '-1.5%',
          'position': 'absolute',
          'zIndex': '11',
          'top': '-2.3%',
          'opacity': '0.0'
        },
        'attributes': {
          'height': '460',
          'width': '465'
        }
    };
    for (var prop in vidCircleProps.attributes) {
      VoiceItModalRef.domRef.videoCircle.setAttribute(prop, vidCircleProps.attributes[prop]);
    }
    for (var prop in vidCircleProps.styles) {
      VoiceItModalRef.domRef.videoCircle.style[prop] = vidCircleProps.styles[prop];
    }
    var circleMask = document.createElementNS(svgNS, 'mask');
    circleMask.setAttribute('id', 'viCircleMask');
    var whiteRectangle = document.createElementNS(svgNS, 'rect');
    var rectAttrs =
    {
        'x': '0',
        'y': '0',
        'width': '500',
        'height': '500',
        'fill': 'white'
    };
    for (var prop in rectAttrs) {
      whiteRectangle.setAttribute(prop, rectAttrs[prop]);
    }
    circleMask.appendChild(whiteRectangle);
    var innerBlackCircle = document.createElementNS(svgNS, 'circle');
    var blackCircleAttrs =
    {
        'cx': '230',
        'cy': '180',
        'r': videoCircleRadius,
        'fill': 'black'
    };
    for (var prop in blackCircleAttrs) {
      innerBlackCircle.setAttribute(prop, blackCircleAttrs[prop]);
    }
    circleMask.appendChild(innerBlackCircle);
    VoiceItModalRef.domRef.videoCircle.appendChild(circleMask);
    var circleGroup = document.createElementNS(svgNS, 'g');
    circleGroup.setAttribute('mask', 'url(#viCircleMask)');
    var soundCircle = document.createElementNS(svgNS, 'circle');
    soundCircle.style.opacity = '1.0';
    soundCircle.style.zIndex = '13';
    var soundCircleAttrs =
    {
        'cx': '230',
        'cy': '180',
        'r': videoCircleRadius,
        'fill': '#FFFFFF'
    };
    for (var prop in soundCircleAttrs) {
      soundCircle.setAttribute(prop, soundCircleAttrs[prop]);
    }
    circleGroup.appendChild(soundCircle);

    VoiceItModalRef.domRef.videoCircle.appendChild(circleGroup);
    VoiceItModalRef.domRef.overlayHolder.insertBefore(VoiceItModalRef.domRef.videoCircle, VoiceItModalRef.domRef.overlayHolder.firstChild);
    var analyser;
    var amp;
    var animationId;
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    }).then(function(stream) {
        var context = new AudioContext();
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.85;
        context.createMediaStreamSource(stream).connect(analyser);
        analyser.minDecibels = -95;
        amp = new Uint8Array(analyser.frequencyBinCount);
        VoiceItModalRef.videoCircleStream = stream;
        function drawSoundCircle() {
          analyser.getByteFrequencyData(amp);
          var vol = vi$.getRMS(amp);
          var soundCircleRadius = (vol / 3) + videoCircleRadius;
          soundCircle.setAttribute('r', soundCircleRadius);
          animationId = window.requestAnimationFrame(drawSoundCircle);
        }
        animationId = window.requestAnimationFrame(drawSoundCircle);
        // Add animation to cleanup array
        VoiceItModalRef.cleanupFunctions.push(function(){
          window.cancelAnimationFrame(animationId);
        });
    }).catch(function(err) {
        console.log('modal.js VoiceItModalRef.createVideoCircle navigator.mediaDevices.getUserMedia Exception: ', err);
    });
    vi$.fadeIn(VoiceItModalRef.domRef.videoCircle, 500);
  }

  VoiceItModalRef.showEnrollmentDeletionWarningOverlay = function() {
    VoiceItModalRef.domRef.warningOverlay.style.display = 'flex';
    VoiceItModalRef.domRef.readyButton.style.display = 'none';
    VoiceItModalRef.domRef.readyButton.style.opacity = 0;
    if(VoiceItModalRef.domRef.imageCanvas) {
       VoiceItModalRef.domRef.imageCanvas.style.opacity = 0.0;
    }
  };

  VoiceItModalRef.darkenCircle = function(darken){
    if(darken){
      vi$.fadeOut(VoiceItModalRef.domRef.outerOverlay, 300);
    } else {
      vi$.fadeIn(VoiceItModalRef.domRef.outerOverlay, 300);
    }
  }

  VoiceItModalRef.destroy = function() {
    VoiceItModalRef.removeWaitingLoader();
    while(VoiceItModalRef.cleanupFunctions.length != 0){
      VoiceItModalRef.cleanupFunctions.shift()();
    }

    if (VoiceItModalRef.videoCircleStream !== undefined) {
      VoiceItModalRef.videoCircleStream.getTracks()[0].stop();
      VoiceItModalRef.videoCircleStream = undefined;
    }
    vi$.remove(VoiceItModalRef.domRef.modalDimBackground);
  }

  VoiceItModalRef.destroyVideoCircle = function(){
    vi$.remove(VoiceItModalRef.domRef.videoCircle);
    if (VoiceItModalRef.videoCircleStream !== undefined) {
      VoiceItModalRef.videoCircleStream.getTracks()[0].stop();
      VoiceItModalRef.videoCircleStream = undefined;
    }
  }

  VoiceItModalRef.showErrorAndDestroy = (errorMessage) => {
    VoiceItModalRef.build();
    VoiceItModalRef.show();
    VoiceItModalRef.domRef.viCard.innerHTML = '';
    VoiceItModalRef.domRef.viCard.style.backgroundColor = 'red';
    VoiceItModalRef.domRef.viCard.style.minHeight = '400px';
    VoiceItModalRef.domRef.viCard.style.minHeight = '400px';
    var content = vi$.create('div');
    content.style.bottom = '3.5em';
    content.style.position = 'relative';
    content.style.padding = '0px';
    content.style.backgroundColor = 'red';
    content.style.textAlign = 'center';
    content.setAttribute('class', 'content');
    var messageElement = vi$.create('p');
    messageElement.style.paddingTop = '200px';
    messageElement.style.color = '#FFFFFF';
    messageElement.setAttribute('class', 'ui header');
    messageElement.innerHTML = `${errorMessage}<br/>Please contact support.`;
    content.appendChild(messageElement);
    VoiceItModalRef.domRef.viCard.appendChild(content);
    vi$.delay(2000, function(){
      vi$.fadeOut(VoiceItModalRef.domRef.modalDimBackground, 1100, function(){
        VoiceItModalRef.mainRef.destroy();
      });
    });
  }

}
