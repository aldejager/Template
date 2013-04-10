// Global variable that will tell us whether PhoneGap is ready
var networkState = 'none';
var intervalID = null;
var readyCount = 0;
var date = new Date;

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
   	}, 1000); /* */
}

function onDeviceReady() {		// Code to be executed once the device is finished loading
	
	// Prevent multiple calls of device ready function
	if(readyCount > 0) return; 
    readyCount += 1;
    
    // DEBUG: notify on device status
    //alert('The device is now ready');
    
    // Check if app is configured
    checkConfiguration('init');
    
    // DEBUG: set default config values
    for (var key in config) {
    	var elem = '#' + key;
    	$(elem).val(config[key]);
    }
        
    // Check localStorage for unsent reports
    if (checkUnsent()) {
    	
    }
    
    // Serialize form objects function
    $.fn.serializeObject = function() {
	    var o = {};
	    var a = this.serializeArray();
	    $.each(a, function() {
	        if (o[this.name] !== undefined) {
	            if (!o[this.name].push) {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	    });
	    return o;
	};
	
	$.fn.storeJSON = function(key) {
		var data = JSON.stringify($(this).serializeObject());
		window.localStorage.setItem(key, data);
	}
    
	$('#report').submit(function() {
		
		var key = saveReport();		// save and return key
				
		// Check network connection
		// Submit report
		
		return false;
	})        
}

function checkConnection() {	// Checks current network status
    networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

	// DEBUG: notify on network state
    alert('Connection type: ' + states[networkState]);
}
   
function checkConfiguration(type) {
	if (checkLocalStorage(configFileName) == 0) {
    	alert('App not configured yet');
    	$.mobile.changePage('#configPage');
 	}
 	else {
 		config = JSON.parse(localStorage.getItem(configFileName));

 		// DEBUG - if config check, change page
 		if (type == 'check') $.mobile.changePage('#configPage');
 	}
}

function saveConfiguration() {
	var key = configFileName;
	if (checkLocalStorage(key) != 0) {
		alert("Overwrite configuration!");}
	console.log($(this));
	$('#configForm').storeJSON(key);
}

function saveReport() {
	date = new Date();
	var key = reportFileName + date.getTime();	// Generate report key
	$('#report').storeJSON(key);			// Store report in local storage
	return key;
}

function checkLocalStorage(startsWith) {
    var keyLength = startsWith.length;
    var ii = 0;

    Object.keys(localStorage) 
        .forEach(function(key){ 
            if (key.substring(0,keyLength) == startsWith) {
                ii++;
                //localStorage.removeItem(key); 
            } 
        });
    return ii;
}

function checkUnsent() {
	var unsent = checkLocalStorage(reportFileName) -
				 checkLocalStorage(reportFileName + "sent");
	if (unsent > 0) {
		console.log(unsent + ' unsent reports found');
		return true;
	}
	console.log('no unsent reports found');
	return false;	
}
