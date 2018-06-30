/* 
Copyright (C) 2018, Rob Hansen.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

var Clouseau = {
	config: null, // extension-wide configuration options

	// The Mozilla message composition service -- the interface for
	// everything related to message composition (including forwarding)
	composeService: Components.classes['@mozilla.org/messengercompose;1']
		.getService(Components.interfaces.nsIMsgComposeService),
	
	// The Mozilla alert service.  On OS X the alert() function isn't
	// reliable, so we use the Mozilla notification system instead.
	alertService: Components.classes['@mozilla.org/alerts-service;1']
		.getService(Components.interfaces.nsIAlertsService),
	

	// The Mozilla directory service, which is used for all file I/O.
	// This is used for parsing the config file.
	dirService: Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties),

	// A crossplatform replacement for Javascript alert().  I wasted 
	// way too much time thinking my code was working on OS X when it
	// wasn't -- it was just the alert() call was suppressed due to
	// an OS configuration setting.  You may be tempted to use alert()
	// and forget all about this.  *Don't.*
	notify: function(title, text) {
		try {
			Clouseau.alertService.showAlertNotification(null, 
				title, text, false, '', null);
		} catch(e) {
			Components.utils.reportError(e);
		}
	},
	
	// Loads the configuration file ("clouseau.json") from disk.
	// This file *MUST* be UTF-8, in proper JSON format, and comply
	// to a specific format (see the docs).  This code tries to do
	// smart things in the face of bad input, but it's not perfect.
	// Far from it, in fact.
	//
	// Parameters: none
	// Returns: null
	// Side effects: populates Clouseau.config
	// Errors: leaves Clouseau.config as null
	// Exceptions: will not throw, leaves Clouseau.config as null
	loadConfig: function() {
		try {
			var configFile = Clouseau.dirService.get("ProfD",
				Components.interfaces.nsIFile);
			configFile.append("ses-tb.json")

			if (configFile.exists() && configFile.isReadable()) {
				var str = {};
				var bytesRead = 0;
				var data = "";
				var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					.createInstance(Components.interfaces.nsIFileInputStream);
				var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
					.createInstance(Components.interfaces.nsIConverterInputStream);
				fstream.init(configFile, -1, 0, 0);
				cstream.init(fstream, "UTF-8", 0, 0);

				do { 
					bytesRead = cstream.readString(0xffffffff, str);
					data += str.value;
				} while (bytesRead != 0);
				cstream.close();

				Clouseau.config = JSON.parse(data)
			}
		}
		catch (error) {
			Clouseau.config = null;
		}

		if (Clouseau.config && (Clouseau.config.hasOwnProperty("serverURL") &&
		Clouseau.config.hasOwnProperty("authToken") &&
		Clouseau.config.hasOwnProperty("name") &&
		Clouseau.config.hasOwnProperty("logo"))) {
			document.getElementById("clouseau-button").disabled = false;
		}
		else {
			Clouseau.notify("SES Error", 
				"SES is misconfigured. Malware reporting will be unavailable.")
			document.getElementById("clouseau-button").disabled = true;
		}
	},

	// called on startup.  At present, the only thing it does is call
	// loadConfig().
	//
	// Parameters: none
	// Returns: null
	// Side effects: see Clouseau.config
	// Errors: see Clouseau.loadConfig()
	// Exceptions: will not throw
	startup: function() {
		Clouseau.loadConfig();
	},

	// invoked when messages need to be sent off via email.  At present
	// it only handles emailed reports, but it does that reasonably well.
	//
	// Parameters: none
	// Returns: null
	// Side effects: causes data to be either queued for sending later,
	//               or immediately sent, depending on the user's
	//               Thunderbird preferences
	// Errors: may report errors to the user, but not propagated back
	//         through code
	// Exceptions: will not throw
	reportViaEmail: function() {
		if (null == Clouseau.config) {
			// we shouldn't ever get here, but on the off chance something
			// weird happens...
			Clouseau.notify("SES Error", 
				"SES is misconfigured. Malware reporting will be unavailable.")
			document.getElementById("clouseau-button").disabled = true;
			return;
		}

		var dest = Clouseau.config["serverURL"].match(/^mailto:(.*)$/);
		dest = dest[1] ? dest[1] : null;

		if (dest == null) {
			Clouseau.notify("SES Error", 
				"SES is misconfigured. Malware reporting will be unavailable.")
			document.getElementById("clouseau-button").disabled = true;
			return;
		}

		var msgs = gFolderDisplay.selectedMessages;
		var count = gFolderDisplay.selectedCount;
		var mailserver = gFolderDisplay.displayedFolder.server;
		var confirm = " of mail to\n" + dest + "\nfor inspection"

		if (0 == count) {
			return;
		}

		var sendKind = Clouseau.composeService.kForwardAsAttachment;

		try {
			for (var i = 0 ; i < count ; i += 1) {
				Clouseau.composeService.forwardMessage(dest,
					msgs[i],
					null, // do not open a compose window
					mailserver,
					sendKind);
			}
			if (1 == count) {
				Clouseau.notify("SES",
					"Sent one piece" + confirm);
			} else {
				Clouseau.notify("SES",
					"Sent " + count + " pieces" + confirm);
			}
		} catch (error) {
			Clouseau.notify("Malware Reporter", "Error: " + error);
		}
	},

	// invoked when the client hits the magic button.  At present it
	// only handles emailed reports, but it does that reasonably well.
	//
	// Parameters: none
	// Returns: null
	// Side effects: causes data to be either queued for sending later,
	//               or immediately sent, depending on the user's
	//               Thunderbird preferences
	// Errors: may report errors to the user, but not propagated back
	//         through code
	// Exceptions: will not throw
	report: function() {
		var email = Clouseau.config["serverURL"].match(/^mailto:(.*)$/);
		if (email[1]) {
			Clouseau.reportViaEmail();
		}
	}
}

window.addEventListener("load", Clouseau.startup, false);