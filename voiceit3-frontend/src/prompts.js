export default function Prompts(language) {
  var promptsRef = this;
  promptsRef.currentPhrase = '';

  switch(language) {
      case 'es-ES':
        promptsRef.prompts = {
          ERROR: "Ocurrió un error:",
          BEGIN: "Comenzar",
          CONTINUE: "Continuar",
          CANCEL: "Cancelar",
          DONE: "Listo",
          VOICE_FACE_SETUP: "Configurar verificación de rostro + voz.",
          VOICE_FACE_SETUP_SUBTITLE: "Esto te permite iniciar sesión verificando tu rostro y tu voz.",
          VOICE_FACE_READY: "La verificación de rostro y voz está lista para ser usada." ,
          VOICE_FACE_READY_SUBTITLE: "Ahora puedes usar tu rostro y tu voz en lugar de una contraseña para iniciar sesión de forma segura.",
          FACE_SETUP: "Configurar verificación facial.",
          FACE_SETUP_SUBTITLE: "Esto te permite iniciar sesión verificando tu rostro.",
          FACE_READY: "La verificación facial está lista.",
          FACE_READY_SUBTITLE:"Ahora puedes usar tu rostro en lugar de una contraseña para iniciar sesión de forma segura.",
          VOICE_SETUP:"Configurar verificación de voz.",
          VOICE_SETUP_SUBTITLE:"Esto te permite iniciar sesión verificando tu voz.",
          VOICE_READY:"La verificación de voz está lista.",
          VOICE_READY_SUBTITLE:"Ahora puedes usar tu voz en lugar de una contraseña para iniciar sesión de forma segura.",
          LOOK_INTO_CAM:"Por favor, mira a la cámara",
          GET_READY:"Prepárate...",
          GET_ENROLLED:"Ok, vamos a enrolarte",
          GET_VERIFIED:"Ok, vamos a verificarte",
          READY_FOR_VOICE_VERIFICATION: "Prepárate para verificar tu voz",
          VERIFY: function() {
            return `Por favor di <br/>"${promptsRef.currentPhrase}"`;
          },
          VERIFY_FACE: "Espera mientras ejecutamos la verificación.",
          ENROLL_FACE: "Espera mientras ejecutamos el enrolamiento.",
          VERIFY_FACE_FAILED: "Verificación facial fallida.",
          VERIFY_FACE_FAILED_TRY_AGAIN: "Verificación facial fallida. Inténtalo de nuevo.",
          VIDEO_VERIFY_FAILED:"Verificación de video fallida.",
          ENROLL_0: function() {
            return `Por favor di <br/>"${promptsRef.currentPhrase}"`;
          },
          ENROLL_1: function() {
            return `Por favor di <br/>"${promptsRef.currentPhrase}"<br/> otra vez`;
          },
          ENROLL_2: function() {
            return `Por favor di <br/>"${promptsRef.currentPhrase}"<br/> una última vez`;
          },
          FACE_ENROLL:" Espera a que enrolemos tu rostro.",
          WAITING:"Por favor, espera.",
          WAIT_FOR_FACE_VERIFICATION:"Espera mientras verificamos tu rostro.",
          TOO_MANY_ATTEMPTS:"¡Lo sentimos! Fallaste demasiadas veces. Vuelve a intentarlo más tarde.",
          SUCC_ENROLLMENT_1:"El primer enrolamiento se realizó correctamente.",
          SUCC_ENROLLMENT_2:"El segundo enrolamiento se realizó correctamente.",
          SUCC_ENROLLMENT_3:"Has sido enrolado correctamente.",
          SUCC_VERIFICATION:"Has sido verificado correctamente.",
          SUCC:"Has sido verificado correctamente.",
          PDNM: function() {
            return `Asegúrate de decir la frase correcta: "${promptsRef.currentPhrase}"`;
          },
          CLNE: "El idioma del contenido no está habilitado para el nivel gratuito, solo no-STT está disponible en el plan de nivel gratuito VoiceIt",
          FNFD:"Lo siento, hemos encontrado tu cara.\n Vuelve a intentarlo.",
          DDNE:"Lo siento, algo salió mal.\n Vuelve a intentarlo.",
          FAIL:"Algo ha fallado.\n Vuelve a intentarlo.",
          IFVD:"Lo siento, no se pudo procesar el video.\n Vuelve a intentarlo.",
          SRNR:"Lo siento, no pude oírle.\n Habla más alto.",
          TVER:" Lo siento, no se encontraron enrolamientos de video.\n Por favor, enrólate.",
          NFEF:" Lo siento, no se encontraron enrolamientos faciales.\n Por favor, enrólate. ",
          NEHSD:"Lo siento, no pude entenderte.\n Habla más despacio",
          NSPE:"Lo siento, tu enrolamiento no es lo suficientemente similar a los anteriores.\n Asegúrese de enrolar sólo a una persona por vez",
          STTF:"Lo siento, no pude entenderte. Asegúrate de decir la frase correcta",
          SSTQ:"Lo siento, no pude escucharte.\n Por favor, habla más alto",
          SSTL:"Se ha escuchado un poco ruidoso.\n Intenta de nuevo, hablando a un volumen normal",
          RWPU:"No utilices grabaciones. Inténtalo de nuevo",
          FTMF: "Asegúrate de que solo se vea tu cara.\n Vuelve a intentarlo",
          FALI: "La verificación de vitalidad falló.\n Vuelve a intentarlo.",
          FADF: "Lo sentimos, no pudimos confirmar una captura en vivo.\n Vuelve a intentarlo con buena iluminación, mirando a la cámara.",
          INJD: "Lo sentimos, no pudimos verificar que la captura provenga de una cámara en vivo.\n Usa la cámara de tu dispositivo y vuelve a intentarlo.",
          IFAD: "Lo siento, no se pudo procesar el audio.\n Vuelve a intentarlo.",
          UDNM: "Lo siento, algo salió mal.\n Vuelve a intentarlo.",
          ENFD: "Lo siento, no se encontró ningún enrolamiento.\n Por favor, enrólate antes de verificar.",
          MISP: "Lo siento, algo salió mal.\n Vuelve a intentarlo.",
          MISU: "Lo siento, algo salió mal.\n Vuelve a intentarlo.",
          EMPF: "La grabación estaba vacía.\n Vuelve a intentarlo.",
          INPP: "Lo siento, algo salió mal.\n Vuelve a intentarlo.",
          INCP: "Lo siento, ese idioma de contenido no es compatible.\n Vuelve a intentarlo.",
          IEID: "Lo siento, algo salió mal.\n Vuelve a intentarlo.",
          NPFC: "Lo siento, no hay frases disponibles para este idioma.",
          DAID: "Esta cuenta está deshabilitada actualmente.\n Ponte en contacto con soporte.",
          UNAC: "Acceso denegado.\n Ponte en contacto con el desarrollador de la aplicación.",
          ULMT: "Se alcanzó el límite de usuarios.\n Ponte en contacto con soporte.",
          EROR: "Lo siento, algo salió mal.\n Vuelve a intentarlo.",
          PNTE: "Lo siento, no se encontraron enrolamientos de voz.\n Por favor, enrólate",
          GERR:"Lo siento, algo salió mal.\n Vuelve a intentarlo",
          CONTACT_DEVELOPER:" Error:\n Póngase en contacto con el desarrollador de la aplicación enviando el código de error",
          UNFD:"Usuario no encontrado. Asegúrate de tener el ID de usuario correcto",
          MAX_ATTEMPTS:"Se superó el máximo de intentos permitidos. Vuelve a intentarlo más tarde",
          REENROLLMENT_WARNING:"Este enrolamiento eliminará todos los enrolamientos anteriores de voz, rostro y video.\n ¿Quieres continuar?",
        }
        break;
      case 'no-STT':
      case 'en-US':
        promptsRef.prompts = {
          ERROR: "An error Occured:",
          BEGIN: "Click to begin",
          CONTINUE: "Continue",
          CANCEL: "Cancel",
          DONE: "Done",
          VOICE_FACE_SETUP: "Setup Face + Voice Verification",
          VOICE_FACE_SETUP_SUBTITLE: "This lets you log in by verifying your face and voice",
          VOICE_FACE_READY: "Face + Voice verification is ready to use",
          VOICE_FACE_READY_SUBTITLE: "You can now use your face and voice instead of a password to securely log in",
          FACE_SETUP: "Setup Face Verification",
          FACE_SETUP_SUBTITLE: "This lets you log in by verifying your face",
          FACE_READY: "Face Verification is Ready",
          FACE_READY_SUBTITLE: "You can now use your face instead of a password to securely log in",
          VOICE_SETUP: "Setup Voice Verification",
          VOICE_SETUP_SUBTITLE: "This lets you log in by verifying your voice",
          VOICE_READY: "Voice Verification is Ready",
          VOICE_READY_SUBTITLE: "You can now use your voice instead of a password to securely log in",
          /* Prompts for Enrollment and Verification Flow */
          LOOK_INTO_CAM: "Please look into the camera",
          GET_READY: "Get ready...",
          GET_ENROLLED: "There you are, let's get you enrolled",
          GET_VERIFIED: "There you are, let's get you verified",
          READY_FOR_VOICE_VERIFICATION: "Please get ready to verify your voice",
          VERIFY: function() {
            return `Please say<br/>"${promptsRef.currentPhrase}"`;
          },
          VERIFY_FACE: "Please wait while we run verification",
          ENROLL_FACE: "Please wait while we run enrollment",
          VERIFY_FACE_FAILED: "Failed face verification",
          VERIFY_FACE_FAILED_TRY_AGAIN: "Failed face verification. Please Try again.",
          VIDEO_VERIFY_FAILED: "Failed video verification",
          ENROLL_0: function() {
            return `Please say<br/>"${promptsRef.currentPhrase}"`;
          },
          ENROLL_1: function() {
            return `Please say<br/>"${promptsRef.currentPhrase}"<br/> again`;
          },
          ENROLL_2: function() {
            return `Please say<br/>"${promptsRef.currentPhrase}"<br/> one last time`;
          },
          FACE_ENROLL: "Please wait for your face to be enrolled",
          WAITING: "Please wait",
          WAIT_FOR_FACE_VERIFICATION: "Please wait while we verify your face",
          TOO_MANY_ATTEMPTS: "Sorry! you failed too many times!! Try again later.",
          SUCC_ENROLLMENT_1: "First enrollment was successful",
          SUCC_ENROLLMENT_2: "Second enrollment was successful",
          SUCC_ENROLLMENT_3: "You've been successfully enrolled",
          SUCC_VERIFICATION: "You've been successfully verified",
          SUCC: "You've been successfully verified",
          /* Response Code Based Prompts */
          PDNM: function() {
            return `Please make sure you are saying the correct phrase: "${promptsRef.currentPhrase}"`;
          },
          CLNE: "Content language not enabled for free tier, only no-STT is available on the VoiceIt free tier plan",
          FNFD: "Sorry, I couldn't quite see your face.\nPlease try again.",
          DDNE: "Sorry, something went wrong.\nPlease try again.",
          FAIL: "Failed.\nPlease try again.",
          IFVD: "Sorry, something went wrong.\nPlease try again.",
          SRNR: "Sorry, I couldn't quite hear you.\nPlease speak louder.",
          TVER: "Sorry, no video enrollments found.\nPlease enroll before verifying.",
          NFEF: "Sorry, no face enrollments found.\nPlease enroll before verifying.",
          NEHSD: "Sorry, I couldn't quite catch that.\nPlease speak slower.",
          NSPE: "Sorry, your enrollment was not similar enough to previous enrollments.\nMake sure to enroll only one person at a time.",
          STTF: "Sorry, I couldn't understand you. Make sure to say the correct phrase",
          SSTQ: "Sorry, I couldn't quite hear you.\nPlease speak louder.",
          SSTL: "Oh! Its getting a little too loud in here.\nLet's try this again, speaking at a normal volume",
          RWPU: "Please do not use recordings. Try that again.",
          FTMF: "Make sure only your face is visible.\nPlease try again.",
          FALI: "Liveness check failed.\nPlease try again.",
          FADF: "Sorry, we couldn't confirm a live capture.\nPlease try again in good lighting, looking directly at the camera.",
          INJD: "Sorry, we couldn't verify this capture came from a live camera.\nPlease use your device's camera and try again.",
          IFAD: "Sorry, the audio couldn't be processed.\nPlease try again.",
          UDNM: "Sorry, something went wrong.\nPlease try again.",
          ENFD: "Sorry, no enrollment was found.\nPlease enroll before verifying.",
          MISP: "Sorry, something went wrong.\nPlease try again.",
          MISU: "Sorry, something went wrong.\nPlease try again.",
          EMPF: "The recording was empty.\nPlease try again.",
          INPP: "Sorry, something went wrong.\nPlease try again.",
          INCP: "Sorry, that content language isn't supported.\nPlease try again.",
          IEID: "Sorry, something went wrong.\nPlease try again.",
          NPFC: "Sorry, no phrases are available for this language.",
          DAID: "This account is currently disabled.\nPlease contact support.",
          UNAC: "Access denied.\nPlease contact the app developer.",
          ULMT: "The user limit has been reached.\nPlease contact support.",
          EROR: "Sorry, something went wrong.\nPlease try again.",
          PNTE: "Sorry, no voice enrollments found.\nPlease enroll before verifying.",
          GERR: "Sorry, something went wrong.\nPlease try again.",
          CONTACT_DEVELOPER: "Error:\n Please contact app developer with response code \"MESSAGE_HERE\".",
          UNFD: "User not found. Pease make sure you have the right user ID",
          MAX_ATTEMPTS: "Exceeded maximum attempts allowed. Please try again later",
          REENROLLMENT_WARNING: "Reenrollment will delete all previous voice, face, and video enrollments. \n Proceed?",
        };
        break;
      default:
        promptsRef.prompts = null;
  };

  promptsRef.setCurrentPhrase = function(phrase) {
    promptsRef.currentPhrase = phrase;
  }

  promptsRef.getCurrentPhrase = function() {
    return promptsRef.currentPhrase;
  }

  promptsRef.getPrompt = function(promptName) {
    if (typeof promptsRef.prompts[promptName] === "function") {
      return promptsRef.prompts[promptName]();
    } else {
      return promptsRef.prompts[promptName];
    };
  }

}
