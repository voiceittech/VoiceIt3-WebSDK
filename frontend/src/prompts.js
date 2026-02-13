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
          IFWD:"Lo siento, algo salió mal.\n Vuelve a intentarlo.",
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
          PNTE: "Lo siento, no se encontraron enrolamientos de voz.\n Por favor, enrólate",
          GERR:"Lo siento, algo salió mal.\n Vuelve a intentarlo",
          CONTACT_DEVELOPER:" Error:\n Póngase en contacto con el desarrollador de la aplicación enviando el código de error",
          UNFD:"Usuario no encontrado. Asegúrate de tener el ID de usuario correcto",
          MAX_ATTEMPTS:"Se superó el máximo de intentos permitidos. Vuelve a intentarlo más tarde",
          REENROLLMENT_WARNING:"Este enrolamiento eliminará todos los enrolamientos anteriores de voz, rostro y video.\n ¿Quieres continuar?",
          /* Liveness Prompts */
          LIVENESS_READY_PROMPT:"Acércate a la cámara. Realizarás una serie predeterminada de desafíos de vitalidad. Tendrás 2 segundos para realizar cada prueba, seleccionadas al azar de las siguientes tres: ",
          LIVENESS_SUCCESS:"Has sido verificado correctamente",
          LIVENESS_TIMEDOUT:"Lo siento, se agotó el tiempo de espera. Realiza las pruebas de vitalidad rápidamente",
          LIVENESS_FAILED:"Lo siento, la verificación falló",
          LIVENESS_TRY_AGAIN:"La prueba falló, vuelve a intentarlo"
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
          PNTE: "Sorry, no voice enrollments found.\nPlease enroll before verifying.",
          GERR: "Sorry, something went wrong.\nPlease try again.",
          CONTACT_DEVELOPER: "Error:\n Please contact app developer with response code \"MESSAGE_HERE\".",
          UNFD: "User not found. Pease make sure you have the right user ID",
          MAX_ATTEMPTS: "Exceeded maximum attempts allowed. Please try again later",
          REENROLLMENT_WARNING: "Reenrollment will delete all previous voice, face, and video enrollments. \n Proceed?",
          /* Liveness Prompts */
          LIVENESS_READY_PROMPT: "Please move closer to the camera. You\'ll be performing a predetermined number of liveness challenges. A few examples of the challenges could be the following:",
          LIVENESS_SUCCESS: "You've been successfully verified",
          LIVENESS_TIMEDOUT: "Sorry, liveness timed out. Please perform the liveness tests quickly",
          LIVENESS_FAILED: "Sorry, verification failed",
          LIVENESS_TRY_AGAIN: "Liveness test failed, please try again"
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
