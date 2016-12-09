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

function tryer() { try{ main() } catch (error) {alert(error)}; }
document.onload = main();

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
            console.log(urls);
        });
    }catch (error) {}

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

    if(chrome.app.window.get("nckgahadagoaajjgafhacjanaoiihapd") != null ) {
        lightState = true;
    } else {
        lightState = false;
    }
}
function controlLight() {
        chrome.runtime.sendMessage(HANGOUTS_LIGHT_APP_ID, {light_state: lightState},
            function(response) {
            });
}

function timedLoop() {
    refreshUrls();
    checkForHangouts();
    if(!lightState) checkForHangoutsApp();
    controlLight()
    setTimeout(timedLoop, 5000)
};


function main() {

    timedLoop();
};

chrome.browserAction.onClicked.addListener(function (tab) {
    tryer();
});


