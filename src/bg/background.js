// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts

//Instance Variables
var urls = []; //This variable will hold all the urls that the user currently has open
var hangoutUrls = ["mail.google.com", "hangouts.google.com"]; //These are the sites that will cause the light to light up
var lightState = false; //The light defaults to the off position
const HANGOUTS_LIGHT_APP_ID = "ghcabdmgenbpngldggklmecdkcebbhfj"; //This the extension id (unique code) for the companion app
const HANGOUTS_APP_EXTENSION_URL = "knipolnnllmklapflnccelgolnpehhpl"; //This is the extension id for the hangouts app on the chromebook so if a student opens the app instead of the website the light will still light up
var goOn = false; //This instance variable is used for checking if the app is open

function tryer() {
    try {
        main()
    } catch (error) {
        console.log("Something went wrong!")
    }
} // This method encapsulates the entire program so if it fails, it will fail gracefully
document.onload = tryer(); //When the chromebook boots up, start the extension

/**
 * This function refreshes the urls and changes the instance variable: "urls" which is an array of urls
 */
function refreshUrls() {
    try {
        chrome.windows.getAll(null, function (windows) { //Queries all windows
            urls = [];
            for (var windowIndex = 0; windowIndex < windows.length; windowIndex++) { // Iterates through all the windows

                chrome.tabs.getAllInWindow(windows[windowIndex].id, function (tabs) { // Queries all tabs
                    for (var i = 0; i < tabs.length; i++) { // Iterates through all the tabs

                        function extractDomain(url) { //This function takes the complete url of the page and strips it so http://mail.google.com/blah/blahblah/231 becomes "mail.google.com"
                            var domain;
                            if (url.indexOf("://") > -1) {
                                domain = url.split('/')[2];
                            }
                            else {
                                domain = url.split('/')[0];
                            }
                            domain = domain.split(':')[0];
                            return domain;
                        }

                        urls.push(extractDomain(tabs[i].url)); // Adds all the urls to the urls variable
                    }
                });
            }
        });
    }catch (error) {}

}
/**
 * This function checks to see if we are done querying app windows
 *
 */
function isDone() {
    if(goOn) return true;
    goOne = false;
}


/**
 * This function compares the currently open urls against the hangout urls to see if hangouts is opened.
 * It changes the lightState variable
 */
function checkForHangouts() {
    var denied = false; //Defaults to light off
    if (urls.length > 0) { //if the url list has urls in it
        for (var i = 0; i < urls.length; i++) { //Check through all the urls
            for (var checkeri = 0; checkeri < hangoutUrls.length; checkeri++) {
                if (urls[i] == hangoutUrls[checkeri]) {
                    denied = true; //If the url is in the list of the denied urls then light up the light
                }
            }
        }
    }
    lightState = denied; //Make the global variable light state true or on
}

/**
 * This function checks for the state of the chrome app: hangouts
 * If the user is not using a website and instead the app: this function detects it
 *
 */

function checkForHangoutsApp() {
    var d = false; //Start out with the light state being off
    chrome.windows.getAll({populate: true, windowTypes: ['app']}, function (window_list) { //Get all the currently open app windows
        for (var i = 0; i < window_list.length; i++) { //Go through that list
            for( var c = 0; c < window_list[i].tabs.length; c++ ) {
                if (window_list[i].tabs[c]['url'].includes(HANGOUTS_APP_EXTENSION_URL)) { //If the app window is the hangouts app window
                    d = true; //Turn on the light
                }
            }
        }
        lightState = d; //Make the global variable light state true or on
        goOn = true; //Tell the rest of the program that it can continue and the check for the app has finished
    });
}

/**
 * This function tells the other extension (The one that controls the light) the lightState using the light state variable
 * If it wants the light to turn on, it sends true likewise off is false
 */
function controlLight() {
        chrome.runtime.sendMessage(HANGOUTS_LIGHT_APP_ID, {light_state: lightState},
            function(response) {
            });
}

/**
 * This function goes along with the isDone function and basically pauses the checking while waiting for a response
 * from the check for the actual app, then it resumes it
 */
function checkForComplete() {
    if (isDone()) { //If everything has completed go back to normal function
        controlLight();
        setTimeout(timedLoop, 5000)
    } else { //Everything hasnt completed, then continue checking
        setTimeout(checkForComplete, 100)
    }
}

/**
 * This function is the heartbeat of the program,
 * Every about 5 seconds it executes itself and runs through the complete process of checking
 * for hangouts and controlling the light
 */
function timedLoop() {
    refreshUrls(); //Fill the URL list with all new urls
    checkForHangouts(); //Check for the hangouts websites
    if (!lightState) { //If the websites aren't open: check for the hangouts app
        checkForHangoutsApp(); //Checks for hangouts app
        setTimeout(checkForComplete, 100); //Starts the check to see if the other check has completed
    } else { //If it gets here, that means one of the websites is open
        controlLight(); //Trigger the app to control the light (Turn it on or off)
        setTimeout(timedLoop, 5000); //Runs the timed loop again in 5 seconds

    }
}
/**
 * The main function just to encapuslate the timed loop
 */
function main() {

    timedLoop();
}


