package websdk

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt"
	voiceit2 "github.com/voiceittech/VoiceIt3-Go/v2"
	"github.com/voiceittech/VoiceIt3-Go/v2/structs"
	"github.com/voiceittech/VoiceIt3-WebSDK/voiceit-go-websdk/utils"
)

const (
	platformVersion = "1.6.0"
	platformId      = "53"
)

type BaseUrls struct {
	API2           string
	LivenessServer string
}

type WebSDK struct {
	vi                         voiceit2.VoiceIt2
	livenessServerClient       LivenessServerClient
	sessionExpirationTimeHours int
}

func (websdk WebSDK) GetSessionExpirationTimeHours() int {
	return websdk.sessionExpirationTimeHours
}

func (websdk WebSDK) GetAPI2Client() voiceit2.VoiceIt2 {
	return websdk.vi
}

func (websdk WebSDK) GetLivenessServerClient() LivenessServerClient {
	return websdk.livenessServerClient
}

func (websdk *WebSDK) Initialize(apiKey, apiToken string, sessionExpirationTimeHours int, baseUrls ...BaseUrls) {

	var api2BaseUrl, livenessServerBaseUrl string

	if len(baseUrls) < 1 { // baseUrls optional parameter not passed
		api2BaseUrl, livenessServerBaseUrl = "https://api.voiceit.io", "https://liveness.voiceit.io"
	} else {
		if baseUrls[0].API2 != "" {
			api2BaseUrl = baseUrls[0].API2
		} else {
			api2BaseUrl = "https://api.voiceit.io"
		}

		if baseUrls[0].LivenessServer != "" {
			livenessServerBaseUrl = baseUrls[0].LivenessServer
		} else {
			livenessServerBaseUrl = "https://liveness.voiceit.io"
		}
	}

	websdk.vi = voiceit2.VoiceIt2{
		APIKey:   apiKey,
		APIToken: apiToken,
		BaseUrl:  api2BaseUrl,
	}

	websdk.livenessServerClient = LivenessServerClient{
		APIKey:   apiKey,
		APIToken: apiToken,
		BaseUrl:  livenessServerBaseUrl,
	}

	websdk.sessionExpirationTimeHours = sessionExpirationTimeHours

	voiceit2.PlatformVersion = platformVersion
	voiceit2.PlatformId = platformId

}

type Claims struct {
	UserId string `json:"userId"`
	jwt.StandardClaims
}

func (websdk WebSDK) GenerateTokenForUser(userId string) (string, error) {

	expirationTime := time.Now().Add(time.Duration(websdk.sessionExpirationTimeHours) * time.Hour)
	// Create the JWT claims, which includes the username and expiry time
	claims := &Claims{
		UserId: userId,
		StandardClaims: jwt.StandardClaims{
			// In JWT, the expiry time is expressed as unix milliseconds
			ExpiresAt: expirationTime.Unix(),
		},
	}

	// Declare the token with the algorithm used for signing, and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Create the JWT string
	tokenString, err := token.SignedString([]byte(websdk.vi.APIToken))
	if err != nil {
		// If there is an error in creating the JWT return an internal server error
		return "", errors.New("token.SignedString(websdk.vi.APIKey) Exception: " + err.Error())
	}

	return tokenString, nil

}

func (websdk WebSDK) validateToken(tokenString string) (valid bool, userId string) {

	var claims Claims
	tkn, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(websdk.vi.APIToken), nil
	})

	if err != nil {
		log.Println(`validateToken("` + tokenString + `") -> jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) Exception: ` + err.Error())
		return false, ""
	}

	if !tkn.Valid {
		log.Println(`validateToken("` + tokenString + `") -> !tkn.Valid`)
		return false, ""
	}

	return true, claims.UserId

}

func (websdk WebSDK) MakeCall(r *http.Request) (map[string]interface{}, error) {

	res := make(map[string]interface{})

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		log.Println("r.ParseMultipartForm(32 << 20) Exception: " + err.Error())
		// w.WriteHeader(http.StatusBadRequest)
		// w.Write([]byte("r.ParseMultipartForm(32 << 20) Exception: " + err.Error()))
		return res, errors.New("r.ParseMultipartForm(32 << 20) Exception: " + err.Error())
	}

	viRequestType, viSecureToken := r.FormValue("viRequestType"), r.FormValue("viSecureToken")

	if viRequestType == "" {
		log.Println(`viRequestType == ""`)
		// w.WriteHeader(http.StatusBadRequest)
		// w.Write([]byte("viRequestType not passed"))
		return res, errors.New("viRequestType not passed")
	}

	res["requestType"] = viRequestType

	if viSecureToken == "" {
		log.Println(`viSecureToken == ""`)
		res["responseCode"] = "INVT"
		res["message"] = "Invalid Token"
		// marshaled, _ := json.Marshal(res)
		// w.Write(marshaled)
		return res, nil
	}

	valid, userId := websdk.validateToken(viSecureToken)

	if !valid {
		log.Println(`websdk.validateToken("` + viSecureToken + `"); !valid`)
		res["responseCode"] = "INVT"
		res["message"] = "Invalid Token"
		// marshaled, _ := json.Marshal(res)
		// w.Write(marshaled)
		return res, nil
	}

	// Used to store multipart form file in RAM until it is sent off as part of client request
	buf := bytes.NewBuffer(nil)
	var filename string

	// Used to store the response of client calls
	var clientResponseBytes []byte
	var err error

	// Take file from multpart form request, copy to bytes.Buffer (Usable in client side requests to API 2/Liveness Server), without having to write to disk
	if viRequestType == "createVoiceEnrollment" || viRequestType == "createFaceEnrollment" || viRequestType == "createVideoEnrollment" || viRequestType == "voiceVerification" || viRequestType == "faceVerification" || viRequestType == "faceVerificationWithLiveness" || viRequestType == "videoVerificationWithLiveness" || viRequestType == "videoVerification" {

		var key string
		var extension string

		switch viRequestType {
		case "createVoiceEnrollment", "voiceVerification":
			key = "viVoiceData"
			extension = ".wav"
		case "createFaceEnrollment", "createVideoEnrollment", "faceVerification", "faceVerificationWithLiveness", "videoVerificationWithLiveness", "videoVerification":
			key = "viVideoData"
			extension = ".mp4"
		}

		file, header, err := r.FormFile(key)
		if err != nil {
			log.Println(`r.FormFile("` + key + `") Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = `r.FormFile("` + key + `")` + err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}

		if _, err := io.Copy(buf, file); err != nil {
			log.Println(`io.Copy(buf, file) Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = `io.Copy(buf, file)` + key + `")` + err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}

		// If not filename was passed, create one using psudorandom hash generator
		if header.Filename == "" {
			filename = utils.GenerateRandomHash(32) + extension
		} else {
			filename = header.Filename + extension
		}

		// Make client request to API 2/Liveness Server
	} else if viRequestType == "enoughVoiceEnrollments" || viRequestType == "enoughFaceEnrollments" || viRequestType == "enoughVideoEnrollments" {
		return websdk.enoughEnrollments(res, viRequestType, userId)
		// return
	}

	switch viRequestType {
	case "deleteAllEnrollments":
		clientResponseBytes, err = websdk.vi.DeleteAllEnrollments(userId)
	case "createVoiceEnrollment":
		clientResponseBytes, err = websdk.vi.CreateVoiceEnrollmentByByteSlice(userId, r.FormValue("viContentLanguage"), r.FormValue("viPhrase"), filename, buf.Bytes())
	case "createFaceEnrollment":
		clientResponseBytes, err = websdk.vi.CreateFaceEnrollmentByByteSlice(userId, filename, buf.Bytes(), false)
	case "createVideoEnrollment":
		clientResponseBytes, err = websdk.vi.CreateVideoEnrollmentByByteSlice(userId, r.FormValue("viContentLanguage"), r.FormValue("viPhrase"), filename, buf.Bytes())
	case "voiceVerification":
		clientResponseBytes, err = websdk.vi.VoiceVerificationByByteSlice(userId, r.FormValue("viContentLanguage"), r.FormValue("viPhrase"), filename, buf.Bytes())
	case "faceVerification":
		clientResponseBytes, err = websdk.vi.FaceVerificationByByteSlice(userId, filename, buf.Bytes(), false)
	case "videoVerification":
		clientResponseBytes, err = websdk.vi.VideoVerificationByByteSlice(userId, r.FormValue("viContentLanguage"), r.FormValue("viPhrase"), filename, buf.Bytes())
	case "initialLiveness":
		clientResponseBytes, err = websdk.livenessServerClient.GenerateLCORequest(userId, r.FormValue("viContentLanguage"))
	case "faceVerificationWithLiveness":
		// userId, lcoId, biometricType, filename string, fileData []byte, phrase ...string
		clientResponseBytes, err = websdk.livenessServerClient.VideoProcessingRequest(userId, r.FormValue("viLCOId"), "face", filename, buf.Bytes())
	case "videoVerificationWithLiveness":
		clientResponseBytes, err = websdk.livenessServerClient.VideoProcessingRequest(userId, r.FormValue("viLCOId"), "video", filename, buf.Bytes(), r.FormValue("viPhrase"))
	default:
		res["responseCode"] = "IRT"
		res["message"] = `Invalid request type "` + viRequestType + `"`
		// marshaled, _ := json.Marshal(res)
		// w.Write(marshaled)
		return res, nil
	}

	if err != nil {
		log.Println(`Case: "` + viRequestType + `" Client Call Exception: ` + err.Error())
		res["responseCode"] = "BERR"
		res["message"] = "Client Call Exception: " + err.Error()
		// marshaled, _ := json.Marshal(res)
		// w.Write(marshaled)
		return res, nil
	}

	// w.Write(clientResponseBytes)
	if err := json.Unmarshal(clientResponseBytes, &res); err != nil {
		return res, errors.New(`json.Unmarshal([]byte("` + string(clientResponseBytes) + `"), &res) Exception: ` + err.Error())
	}

	return res, nil

}

func (websdk WebSDK) enoughEnrollments(res map[string]interface{}, viRequestType, userId string) (map[string]interface{}, error) {
	switch viRequestType {
	case "enoughVoiceEnrollments":
		var voiceEnrollmentsResponse structs.GetAllVoiceEnrollmentsReturn
		var videoEnrollmentsResponse structs.GetAllVideoEnrollmentsReturn
		ret, err := websdk.vi.GetAllVoiceEnrollments(userId)
		if err != nil {
			log.Println(`websdk.vi.GetAllVoiceEnrollments("` + userId + `") Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if err := json.Unmarshal(ret, &voiceEnrollmentsResponse); err != nil {
			log.Println(`json.Unmarshal([]byte("` + string(ret) + `"), &voiceEnrollmentsResponse) Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			return res, nil
		}
		ret, err = websdk.vi.GetAllVideoEnrollments(userId)
		if err != nil {
			log.Println(`websdk.vi.GetAllVideoEnrollments("` + userId + `") Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if err := json.Unmarshal(ret, &videoEnrollmentsResponse); err != nil {
			log.Println(`json.Unmarshal([]byte("` + string(ret) + `"), &videoEnrollmentsResponse) Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if voiceEnrollmentsResponse.ResponseCode == "SUCC" && videoEnrollmentsResponse.ResponseCode == "SUCC" && voiceEnrollmentsResponse.Count+videoEnrollmentsResponse.Count >= 3 {
			res["enoughEnrollments"] = true
		} else {
			res["enoughEnrollments"] = false
		}

	case "enoughFaceEnrollments":
		var faceEnrollmentsResponse structs.GetAllFaceEnrollmentsReturn
		var videoEnrollmentsResponse structs.GetAllVideoEnrollmentsReturn
		ret, err := websdk.vi.GetAllFaceEnrollments(userId)
		if err != nil {
			log.Println(`websdk.vi.GetAllFaceEnrollments("` + userId + `") Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if err := json.Unmarshal(ret, &faceEnrollmentsResponse); err != nil {
			log.Println(`json.Unmarshal([]byte("` + string(ret) + `"), &faceEnrollmentsResponse) Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		ret, err = websdk.vi.GetAllVideoEnrollments(userId)
		if err != nil {
			log.Println(`websdk.vi.GetAllVideoEnrollments("` + userId + `") Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if err := json.Unmarshal(ret, &videoEnrollmentsResponse); err != nil {
			log.Println(`json.Unmarshal([]byte("` + string(ret) + `"), &videoEnrollmentsResponse) Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if faceEnrollmentsResponse.ResponseCode == "SUCC" && videoEnrollmentsResponse.ResponseCode == "SUCC" && faceEnrollmentsResponse.Count+videoEnrollmentsResponse.Count >= 1 {
			res["enoughEnrollments"] = true
		} else {
			res["enoughEnrollments"] = false
		}
	case "enoughVideoEnrollments":
		var videoEnrollmentsResponse structs.GetAllVideoEnrollmentsReturn
		ret, err := websdk.vi.GetAllVideoEnrollments(userId)
		if err != nil {
			log.Println(`websdk.vi.GetAllVideoEnrollments("` + userId + `") Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if err := json.Unmarshal(ret, &videoEnrollmentsResponse); err != nil {
			log.Println(`json.Unmarshal([]byte("` + string(ret) + `"), &videoEnrollmentsResponse) Exception: ` + err.Error())
			res["responseCode"] = "BERR"
			res["message"] = err.Error()
			// marshaled, _ := json.Marshal(res)
			// w.Write(marshaled)
			return res, nil
		}
		if videoEnrollmentsResponse.ResponseCode == "SUCC" && videoEnrollmentsResponse.Count >= 3 {
			res["enoughEnrollments"] = true
		} else {
			res["enoughEnrollments"] = false
		}
	}
	// marshaled, _ := json.Marshal(res)
	// w.Write(marshaled)
	return res, nil
}
