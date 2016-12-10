// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts

//Instance Variables
var urls = [];
var hangoutUrls = ["mail.google.com","hangouts.google.com"];
var lightState = false;
var currentColor = 'red';
const HANGOUTS_LIGHT_APP_ID = "ghcabdmgenbpngldggklmecdkcebbhfj";
const HANGOUTS_APP_EXTENSION_URL = "knipolnnllmklapflnccelgolnpehhpl";
var goOn = false;

function tryer() { try{ main() } catch (error) {console.log("Something went wrong!")}; }
document.onload = tryer();

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

                        function extractDomain(url) {
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

function isDone() {
    if(goOn) return true;
    goOne = false;
}


/**
 * This function compares the currently open urls against the hangout urls to see if hangouts is opened.
 * It changes the lightState variable
 */
function checkForHangouts() {
    var denied = false;
    if(urls.length > 0) {
        for (var i = 0; i < urls.length; i++) {
            for (var checkeri = 0; checkeri < hangoutUrls.length; checkeri++) {
                if (urls[i] == hangoutUrls[checkeri]) {
                    denied = true;
                }
            }
        }
    }
    lightState = denied;
}

function checkForHangoutsApp() {
    var d = false;
    chrome.windows.getAll({ populate : true, windowTypes : ['app']}, function (window_list) {
        for( var i = 0; i < window_list.length; i++) {
            for( var c = 0; c < window_list[i].tabs.length; c++ ) {
                if(window_list[i].tabs[c]['url'].includes(HANGOUTS_APP_EXTENSION_URL)){
                    d = true;
                }
            }
        }
        lightState = d;
        goOn = true;
    });
}


function controlLight() {
        chrome.runtime.sendMessage(HANGOUTS_LIGHT_APP_ID, {light_state: lightState},
            function(response) {
            });
}
function checkForComplete() {
    if(isDone()) {
        controlLight();
        setTimeout(timedLoop, 5000)
    } else {
        setTimeout(checkForComplete, 100)
    }
}

function timedLoop() {
    refreshUrls();
    checkForHangouts();
    if(!lightState){
        checkForHangoutsApp();
        setTimeout(checkForComplete,100);
    } else {
        controlLight()
        setTimeout(timedLoop, 5000)

    }
};


function main() {

    timedLoop();
};


