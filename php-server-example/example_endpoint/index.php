<?php
session_start();
require('../../voiceit-php-websdk/VoiceIt3WebBackend.php');
include('../config.php');

if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
}

$myVoiceIt = new VoiceIt3WebBackend($VOICEIT_API_KEY, $VOICEIT_API_TOKEN);
$voiceItResultCallback = function($jsonObj){
  $callType = strtolower($jsonObj["callType"]);
  $userId = $jsonObj["userId"];
  if((str_contains($callType, 'Liveness') and $jsonObj["jsonResponse"]["success"] == true) or
  (str_contains($callType, 'Liveness') and $jsonObj["jsonResponse"]["responseCode"] == "SUCC")){
      // User was successfully verified so lookup user details via
      // VoiceIt UserId and begin session
      $_SESSION["userId"] = $userId;
  } else {
      $_SESSION["userId"] = $userId;
  }
};

$myVoiceIt->InitBackend($_POST, $_FILES, $voiceItResultCallback);
?>
