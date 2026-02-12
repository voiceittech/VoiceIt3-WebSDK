package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"

	websdk "github.com/voiceittech/VoiceIt3-WebSDK/voiceit-go-websdk"
)

const (
	HTTP_PORT = "3000"
)

var (
	backend      websdk.WebSDK
	consoleBytes []byte
	faviconBytes []byte
)

func init() {
	bytes, err := ioutil.ReadFile("./views/console.html")
	if err != nil {
		log.Fatal(err.Error())
	}

	consoleBytes = bytes

	bytes, err = ioutil.ReadFile("./public/images/favicon.ico")
	if err != nil {
		log.Fatal(err.Error())
	}
	faviconBytes = bytes

	backend.Initialize(
		VOICEIT_API_KEY,
		VOICEIT_API_TOKEN,
		SESSION_EXPIRATION_TIME_HOURS,
	)
}

func main() {

	router := chi.NewRouter()
	router.Use(middleware.RealIP)
	router.Use(middleware.RequestID)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Logger)

	router.Get("/favicon.ico", func(w http.ResponseWriter, r *http.Request) { w.Write(faviconBytes) })

	router.Post("/login", func(w http.ResponseWriter, r *http.Request) {

		ret := make(map[string]interface{})

		if r.FormValue("email") != DEMO_EMAIL {
			ret["responseCode"] = "UNFD"
			ret["message"] = "User not found. Please make sure you entered the right userId and API credentials in config.go"
			marshaled, _ := json.Marshal(ret)
			w.Write(marshaled)
			return
		}

		if r.FormValue("password") != DEMO_PASSWORD {
			ret["responseCode"] = "INPW"
			ret["message"] = "Incorrect Password"
			marshaled, _ := json.Marshal(ret)
			w.Write(marshaled)
			return
		}

		if VOICEIT_TEST_USER_ID[:4] == "usr_" {
			tok, err := backend.GenerateTokenForUser(VOICEIT_TEST_USER_ID)
			if err != nil {
				log.Println(`backend.GenerateTokenForUser("` + VOICEIT_TEST_USER_ID + `") Exception: ` + err.Error())
				ret["responseCode"] = "BERR"
				ret["message"] = "Unable to generate secure token."
				marshaled, _ := json.Marshal(ret)
				w.Write(marshaled)
				return
			}
			ret["token"] = tok
		}

		ret["responseCode"] = "SUCC"
		ret["message"] = "Successfully authenticated user"
		marshaled, _ := json.Marshal(ret)
		w.Write(marshaled)

	})

	router.Get("/logout", func(w http.ResponseWriter, r *http.Request) {
		// No cookie sessions need to be reset since all sessions handled inside custom client wrapper code in frontend
		http.Redirect(w, r, "/", 302)
	})

	router.Get("/console", func(w http.ResponseWriter, r *http.Request) { w.Write(consoleBytes) })

	router.Post("/example_endpoint", func(w http.ResponseWriter, r *http.Request) {
		ret, err := backend.MakeCall(r)
		if err != nil {
			w.Write([]byte("backend.MakeCall(w, r) Exception: " + err.Error()))
			return
		}
		bytes, _ := json.Marshal(ret)
		w.Write(bytes)
	})
	router.Post("/example_endpoint/", func(w http.ResponseWriter, r *http.Request) {
		ret, err := backend.MakeCall(r)
		if err != nil {
			w.Write([]byte("backend.MakeCall(r) Exception: " + err.Error()))
			return
		}
		bytes, _ := json.Marshal(ret)
		w.Write(bytes)
	})

	router.Get("/content_language", func(w http.ResponseWriter, r *http.Request) {
		ret := make(map[string]string)
		ret["contentLanguage"] = CONTENT_LANGUAGE
		marshaled, _ := json.Marshal(ret)
		w.Write(marshaled)
	})

	fileServer(router)

	fmt.Println("Serving VoiceIt WebSDK Example at port :" + HTTP_PORT)
	log.Fatal(http.ListenAndServe(":"+HTTP_PORT, router))
}

func fileServer(router *chi.Mux) {
	root := "public/"
	fs := http.FileServer(http.Dir(root))

	router.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		if _, err := os.Stat(root + r.RequestURI); os.IsNotExist(err) {
			http.StripPrefix(r.RequestURI, fs).ServeHTTP(w, r)
		} else {
			fs.ServeHTTP(w, r)
		}
	})
}
