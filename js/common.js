// Global variable that will tell us whether PhoneGap is ready

// Initiation parameters
var intervalID = null;
var readyCount = 0;

// Global parameters
var noStorage = false;
var indexing = {};
var networkState = 'none';

// Set an onload handler to call the init function
window.onload = init;

function init() {				// Runs when DOM has finished loading
	
	if (!Modernizr.localstorage) {
		noStorage = true;
		$('#saveReport').hide();
		alert("Cannot store reports locally. Use app only with stable internet connection!")
	}
	
    // Add an event listener for deviceready
    document.addEventListener('deviceready', onDeviceReady, false);
	
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
    
    
    //          Methods on device ready 			//
    // -------------------------------------------- //
    
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
	
	// Store object as JSON by key
	$.fn.storeJSON = function(key) {
		var data = JSON.stringify($(this).serializeObject());
		console.log("JSON stored: " + data);
		localStorage.setItem(key, data);
	}
	
	// Save a sent report
	$.fn.saveSent = function(key) {
		if (noStorage) return false;
		localStorage.removeItem(key);
		key = key + '-sent';
		$(this).storeJSON(key);
		
		return key;
	}
	
	// -------------------------------------------- //
    
    // DEBUG: notify on device status
    //alert('The device is now ready');
    
    // Check connection
    checkConnection();
    
    // Check if app is configured
    checkConfiguration('init');
    
    // Load report indexing
    loadReportIndex();
    
    // Show current (or default) configuration
    for (var key in config) {
    	var elem = '#' + key;
    	$(elem).val(config[key]);
    }
        
    // Check localStorage for unsent reports
    var unsentReports = findUnsentReports();
    if (unsentReports.length > 0 && ) {
    	// Check connection
    	console.log(unsentReports.length + "unsent reports found");
    	// Send reports
    }
    
    // 
    
    // Handle report submission
	$('#report').submit(function() {
		event.preventDefault();
		
		var key = saveReport();		// save and return key
		var success = sendReport(key); // send and confirm success

		// If succesfull, include sent marker and remove instance
		if (!success) {
			indexing.count += 1;
			localStorage.setItem(indexFileName,JSON.stringify(indexing));
			alert("File not sent!");
			return false;
		}
		if (key == false) {
			alert("File not saved!");
			return false;
		}
		
		key = $(this).saveSent(key);	// saves and increments index
		incrementIndex();

		console.log("Submit completed");	
		return false;
	}) // report submit
	
} // Device Ready

function checkConnection() {	// Checks current network status
    networkState = navigator.connection.type;
    //console.log(networkState);

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';
    
    //console.log(states);

	// DEBUG: notify on network state
    console.log("Connection type: " + states[networkState]);
}
   
function checkConfiguration(type) {
	if (noStorage) return false;
	if (checkLocalStorage(configFileName) == 0) {
    	alert("App not configured yet");
    	$.mobile.changePage('#configPage');
 	}
 	else {
 		config = JSON.parse(localStorage.getItem(configFileName));

 		// DEBUG - if config check, change page
 		if (type == 'check') $.mobile.changePage('#configPage');
 	}
}

function loadReportIndex() {
	if (noStorage) return 0;
	if (checkLocalStorage(indexFileName) == 0) {
		indexing = { count: 0, increment: true};
		localStorage.setItem(indexFileName,JSON.stringify(indexing));
	}
	indexing = JSON.parse(localStorage.getItem(indexFileName));
}

function incrementIndex() {
	indexing.count += 1;
	localStorage.setItem(indexFileName,JSON.stringify(indexing));
}

function saveReport() {
	if (noStorage) return false;
	//var key = getKey(reportFileName);	    // Generate report key
	var key = reportFileName + indexing.count;
	$('#report').storeJSON(key);			// Store report in local storage
	//$(indexing).storeJSON(indexFileName);
	return key;
}

function sendReport(key) {
	checkConnection();	// check network connection
	
    if (networkState != 'wifi' && networkState != 'ethernet') {
		if (networkState.search('g') != -1) {
			console.log("Any of the G's");
		}
		else {	// Inform user by prompt in the future
			console.log("No suitable connection available");
			return false;
		}
	}
	else console.log("Wifi or ethernet available");
	
	// Create destination address
		// Consider method to gather domain info if noStorage
		// ftp://[<user>[:<password>]@]<host>[:<port>]/<url-path>
	checkConfiguration();
	var target = 'http://' + config.domain + '/asr-processor.php';
							
	console.log("Target for data:");
	console.log(target);
	
	if (noStorage || key == false) 
		var report = JSON.stringify($('#report').serializeObject());
	else var report = localStorage.getItem(key);
	
	//var report = JSON.stringify($('#report').serializeObject());
	
	console.log("Data to be send:");
	console.log(report);
	
	// perform some send action
	$.post(target, report, function(data){	
		console.log(data);
	}); /* */
	
	localStorage.setItem(key + '-sent', report);
	
	return true;
}

function checkLocalStorage(snippet) {
	if (noStorage) return 0;
    var ii = 0;

    Object.keys(localStorage) 
        .forEach(function(key){ 
            if (key.search(snippet) != -1) {
                ii++;
                //localStorage.removeItem(key); 
            } 
        });
    return ii;
}

function saveConfiguration() {
	if (noStorage) return false;
	var key = configFileName;
	if (checkLocalStorage(key) != 0) {
		alert("Overwrite configuration!");
	}
	$('#configForm').storeJSON(key);
}

function findUnsentReports() {
	if (noStorage) return false;
	var keys = new Array(0);

	Object.keys(localStorage) 
    	.forEach(function(key){ 
	        if (key.search(reportFileName) != -1 &&
	        		key.search('sent') == -1) {
	            keys.push(key);
	        } 
    }); // Object.keys.forEach

	console.log(keys);
	return keys;	
}

/*function findUnsentReports() {
	if (noStorage) return false;
	var unsent = checkLocalStorage(reportFileName) -
				 checkLocalStorage('sent');
	if (unsent > 0) {
		console.log(unsent + " unsent reports found");
		return true;
	}
	console.log("no unsent reports found");
	return false;	
} */

/*function getKey(filename) {
	if (indexing.increment) {
		indexing.increment = false;
		var ii = 0;
		while (ii < 10) {		// infinite loop error... consider limit
			console.log(ii)
			if (checkLocalStorage(filename + ii) == -1) {
				indexing.count = ii;
				console.log(filename + ii);
				return filename + ii;
				ii++
			}
			ii++;
		}
	}
	return filename + indexing.count;
} */

/* function checkLocalStorage(startsWith) {
	if (noStorage) return 0;
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
} */

// window.localStorage.removeItem("key");