// Global variable that will tell us whether PhoneGap is ready
var connectionType = 'none';
var intervalID = null;
var readyCount = 0;

// Set an onload handler to call the init function
window.onload = init;

function init() {				// Checks whether PhoneGap has completed loading
	
    // Add an event listener for deviceready
    document.addEventListener("deviceready", onDeviceReady, false);

    // Older versions of Blackberry < 5.0 don't support PhoneGap's custom events
    intervalID = window.setInterval(function() {
    	if (window.cordova) {
    		window.clearInterval(intervalID);
    		onDeviceReady();
   		}
   	}, 1000); /**/
}

function onDeviceReady() {		// Code to be executed once the device is finished loading
	
	if(readyCount > 0) return; 
    	
    readyCount += 1;
    alert('The device is now ready');
        
    // Check localStorage for unsent reports
        
}

function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);
}
   
   