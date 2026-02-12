<?php

require_once 'dependencies/autoload.php';
use \Firebase\JWT\JWT;

function createUUID() {
    return sprintf( '%04x%04x%04x%04x%04x%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000,
        mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

function saveFileData($fileTempName, $extension){
  $fileName = createUUID()."-file.".$extension;
  move_uploaded_file($fileTempName, $fileName);
  return $fileName;
}

function formatResponse($callType, $userId, $jsonResponse){
  $jsonResponseObj = json_decode($jsonResponse, true);
  return array('callType' => $callType, 'userId' => $userId, 'jsonResponse' => $jsonResponseObj);
}

function returnJson($jsonResponse){
  header('Content-Type: application/json');
  echo $jsonResponse;
}

class VoiceIt2WebBackend {
  public $api2BaseUrl;
  const VERSION = '1.6.0';
  public $apiKey;
  public $platformId = '48';
  public $notificationUrl = '';

  function __construct($key, $token, $api2CustomUrl = 'https://api.voiceit.io') {
     $this->apiKey = $key;
     $this->apiToken = $token;
     $this->api2BaseUrl = $api2CustomUrl;
  }

  function checkFileExists($file) {
    if(!file_exists($file)){
      throw new \Exception("File {$file} does not exist");
    }
  }

  public function validateToken($userToken){
    $secret = "SECRET%_".$this->apiToken;
    $isValid = false;
    try {
      JWT::decode($userToken, $secret, array('HS256'));
      $isValid = true;
    } catch (Exception $e) {}
    return $isValid;
  }

  public function getPayload($userToken){
    $secret = "SECRET%_".$this->apiToken;
    $decoded = JWT::decode($userToken, $secret, array('HS256'));
    $result = (array) $decoded;
    return $result["userId"];
  }

  /* Get timstamp for $numDays from now */
  public function getTimeIn($numDays){
    return time() + ($numDays * 24 * 60 * 60);
  }

  public function generateTokenForUser($userId){
    $secret = "SECRET%_".$this->apiToken;
    $token = array(
      "iss" => "https://voiceit.io",
      "aud" => "https://voiceit.io",
      "iat" => time(),
      "nbf" => time(),
      // Add 7 Days Expiry
      "exp" => $this->getTimeIn(7),
      "userId" => $userId
    );

    $jwt = JWT::encode($token, $secret);
    return $jwt;
  }

  public function InitBackend($POST_REF, $FILES_REF, $resultCallback){
    $reqType = "".$POST_REF["viRequestType"];
    $secureToken = "".$POST_REF["viSecureToken"];

    if(!$this->validateToken($secureToken)){
      returnJson(json_encode(array('responseCode' => "INVT", 'message' => 'Invalid Token')));
      return;
    }

    $EXTRACTED_USER_ID = $this->getPayload($secureToken);

    if($reqType == "deleteAllEnrollments"){
      $resp = $this->deleteAllEnrollments($EXTRACTED_USER_ID);
      returnJson($resp);
    }

    if($reqType == "enoughVoiceEnrollments"){
      $resp = $this->getAllVoiceEnrollments($EXTRACTED_USER_ID);
      $resp_voice_obj = json_decode($resp);
      $resp = $this->getAllVideoEnrollments($EXTRACTED_USER_ID);
      $resp_video_obj = json_decode($resp);
      $finalResult = "";
      if($resp_voice_obj->responseCode == "SUCC" && $resp_video_obj->responseCode == "SUCC"){
        if(($resp_voice_obj->count + $resp_video_obj->count) >= 3){
          $finalResult = json_encode(array('enoughEnrollments' => true));
        } else {
          $finalResult = json_encode(array('enoughEnrollments' => false));
        }
      } else {
        $finalResult = json_encode(array('enoughEnrollments' => false));
      }
      returnJson($finalResult);
    }

    if($reqType == "enoughFaceEnrollments"){
      $resp = $this->getAllFaceEnrollments($EXTRACTED_USER_ID);
      $resp_face_obj = json_decode($resp);
      $resp = $this->getAllVideoEnrollments($EXTRACTED_USER_ID);
      $resp_video_obj = json_decode($resp);

      if($resp_face_obj->responseCode == "SUCC" && $resp_video_obj->responseCode == "SUCC"){
        if(($resp_face_obj->count + $resp_video_obj->count) >= 1){
          returnJson(json_encode(array('enoughEnrollments' => true)));
        } else {
          returnJson(json_encode(array('enoughEnrollments' => false)));
        }
      } else {
        returnJson(json_encode(array('enoughEnrollments' => false)));
      }
    }

    if($reqType == "enoughVideoEnrollments"){
      $resp = $this->getAllVideoEnrollments($EXTRACTED_USER_ID);
      $resp_obj = json_decode($resp);
      if($resp_obj->responseCode == "SUCC"){
        if($resp_obj->count >= 3){
          returnJson(json_encode(array('enoughEnrollments' => true)));
        } else {
          returnJson(json_encode(array('enoughEnrollments' => false)));
        }
      } else {
          returnJson(json_encode(array('enoughEnrollments' => false)));
      }
    }

    if($reqType == "createVoiceEnrollment"){
      $contentLang = "".$_POST["viContentLanguage"];
      $phrase = "".$_POST["viPhrase"];
      $recordingFileName = saveFileData($FILES_REF["viVoiceData"]['tmp_name'], "wav");
      $resp = $this->createVoiceEnrollment($EXTRACTED_USER_ID, $contentLang, $phrase, $recordingFileName);
      unlink($recordingFileName) or die("Couldn't delete ".$recordingFileName);
      returnJson($resp);
    }

    if($reqType == "createFaceEnrollment"){
      $videoFileName = saveFileData($FILES_REF["viVideoData"]['tmp_name'], "mp4");
      $resp = $this->createFaceEnrollment($EXTRACTED_USER_ID, $videoFileName);
      unlink($videoFileName) or die("Couldn't delete ".$videoFileName);
      returnJson($resp);
    }

    if($reqType == "createVideoEnrollment"){
      $contentLang = "".$_POST["viContentLanguage"];
      $phrase = "".$_POST["viPhrase"];
      $videoFileName = saveFileData($FILES_REF["viVideoData"]['tmp_name'], "mp4");
      $resp = $this->createVideoEnrollment($EXTRACTED_USER_ID, $contentLang, $phrase, $videoFileName);
      unlink($videoFileName) or die("Couldn't delete ".$videoFileName);
      returnJson($resp);
    }

    if($reqType == "voiceVerification"){
      $contentLang = "".$_POST["viContentLanguage"];
      $phrase = "".$_POST["viPhrase"];
      $recordingFileName = saveFileData($FILES_REF["viVoiceData"]['tmp_name'], "wav");
      $resp = $this->voiceVerification($EXTRACTED_USER_ID, $contentLang, $phrase, $recordingFileName);
      unlink($recordingFileName) or die("Couldn't delete ".$recordingFileName);
      header('Content-Type: application/json');
      $resultCallback(formatResponse($reqType, $EXTRACTED_USER_ID, $resp));
      returnJson($resp);
    }

    if($reqType == "faceVerification"){
      $videoFileName = saveFileData($FILES_REF["viVideoData"]['tmp_name'], "mp4");
      $resp = $this->faceVerification($EXTRACTED_USER_ID, $videoFileName);
      unlink($videoFileName) or die("Couldn't delete ".$videoFileName);
      $resultCallback(formatResponse($reqType, $EXTRACTED_USER_ID, $resp));
      returnJson($resp);
    }

    if($reqType == "videoVerification"){
      $contentLang = "".$_POST["viContentLanguage"];
      $phrase = "".$_POST["viPhrase"];
      $videoFileName = saveFileData($FILES_REF["viVideoData"]['tmp_name'], "mp4");
      $resp = $this->videoVerification($EXTRACTED_USER_ID, $contentLang, $phrase, $videoFileName);
      unlink($videoFileName) or die("Couldn't delete ".$videoFileName);
      $resultCallback(formatResponse($reqType, $EXTRACTED_USER_ID, $resp));
      returnJson($resp);
    }

  }

  public function addNotificationUrl($url) {
     $this->notificationUrl = '?notificationURL='.urlencode($url);
  }

  public function removeNotificationUrl() {
     $this->notificationUrl = '';
  }

  public function getNotificationUrl() {
     return $this->notificationUrl;
  }

  public function createUser() {
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/users'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    return curl_exec($crl);
  }

  public function checkUserExists($userId) {
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/users/'.$userId.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'GET');
    return curl_exec($crl);
  }

  public function deleteUser($userId) {
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/users/'.$userId.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'DELETE');
    return curl_exec($crl);
  }

  public function deleteAllEnrollments($userId) {
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/enrollments/'.$userId.'/all'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'DELETE');
    return curl_exec($crl);
  }

  public function getAllVoiceEnrollments($userId) {
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/enrollments/voice/'.$userId.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'GET');
    return curl_exec($crl);
  }

  public function getAllFaceEnrollments($userId) {
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/enrollments/face/'.$userId.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'GET');
    return curl_exec($crl);
  }

  public function getAllVideoEnrollments($userId) {
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/enrollments/video/'.$userId.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'GET');
    return curl_exec($crl);
  }

	public function createVoiceEnrollment($userId, $contentLanguage, $phrase, $filePath) {
    $this->checkFileExists($filePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/enrollments/voice'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'contentLanguage' => $contentLanguage,
      'phrase' => $phrase,
      'recording' => curl_file_create($filePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
	}

  public function createFaceEnrollment($userId, $filePath) {
    $this->checkFileExists($filePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/enrollments/face'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'video' => curl_file_create($filePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
	}

  public function createVideoEnrollment($userId, $contentLanguage, $phrase, $filePath) {
    $this->checkFileExists($filePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/enrollments/video'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'contentLanguage' => $contentLanguage,
      'phrase' => $phrase,
      'video' => curl_file_create($filePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
	}

  public function voiceVerification($userId, $contentLanguage, $phrase, $filePath) {
    $this->checkFileExists($filePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/verification/voice'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'contentLanguage' => $contentLanguage,
      'phrase' => $phrase,
      'recording' => curl_file_create($filePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
  }

  public function faceVerification($userId, $filePath) {
    $this->checkFileExists($filePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/verification/face'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'video' => curl_file_create($filePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
  }

  public function faceVerificationWithPhoto($userId, $filePath) {
    $this->checkFileExists($filePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/verification/face'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'photo' => curl_file_create($filePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
  }

  public function videoVerification($userId, $contentLanguage, $phrase, $filePath) {
    $this->checkFileExists($filePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/verification/video'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'contentLanguage' => $contentLanguage,
      'phrase' => $phrase,
      'video' => curl_file_create($filePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
  }

  public function videoVerificationWithPhoto($userId, $contentLanguage, $phrase, $audioFilePath, $photoFilePath) {
    $this->checkFileExists($audioFilePath);
    $this->checkFileExists($photoFilePath);
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $this->api2BaseUrl.'/verification/video'.$this->notificationUrl);
    curl_setopt($crl, CURLOPT_USERPWD, "$this->apiKey:$this->apiToken");
    curl_setopt($crl, CURLOPT_HTTPHEADER, array('platformId: '.$this->platformId, 'platformVersion: '.VoiceIt2WebBackend::VERSION));
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($crl, CURLOPT_CUSTOMREQUEST, 'POST');
    $fields = [
      'userId' => $userId,
      'contentLanguage' => $contentLanguage,
      'phrase' => $phrase,
      'audio' => curl_file_create($audioFilePath),
      'photo' => curl_file_create($photoFilePath)
    ];
    curl_setopt($crl, CURLOPT_POSTFIELDS, $fields);
    return curl_exec($crl);
  }

}
?>
