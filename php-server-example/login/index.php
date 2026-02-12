<?php
require('../../voiceit-php-websdk/VoiceIt3WebBackend.php');
include('../config.php');


$email = "".$_POST["email"];
$password = "".$_POST["password"];

if($email == $DEMO_EMAIL && $password == $DEMO_PASSWORD){
  header("HTTP/1.1 200 OK");
  $myVoiceIt = new VoiceIt3WebBackend($VOICEIT_API_KEY, $VOICEIT_API_TOKEN);
  $createdToken = $myVoiceIt->generateTokenForUser($VOICEIT_TEST_USERID);
  $jsonResponse = Array(
    "responseCode" => "SUCC",
    "message" => "Successfully authenticated user",
    "token" => $createdToken
  );
  echo json_encode($jsonResponse);
}
else if($password != $DEMO_PASSWORD){
  header("HTTP/1.1 401 UNAUTHORIZED");
  $jsonResponse = Array(
    "responseCode" => "INPW",
    "message" => "Incorrect Password"
  );
  echo json_encode($jsonResponse);
}
else {
  header("HTTP/1.1 401 UNAUTHORIZED");
  $jsonResponse = Array(
    "responseCode" => "UNFD",
    "message" => "User not found. Please make sure you entered the right userId and API credentials in config.php"
  );
  echo json_encode($jsonResponse);
}
?>
