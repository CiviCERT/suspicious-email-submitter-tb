# Suspicious Email Submitter

The Suspicious Email Submitter is an extension for common web browsers and email clients that enables the user to easily submit a suspicious email with all the information necessary to a pre-configured destination for further analysis, such as a [MISP instance](https://misp-project.org) or email address. This repo is an addon for legacy Thunderbird (XUL-based) and is **discontinued**.

This project is hosted by the [Computer Incident Response Center for Civil Society](https://civicert.org) (CiviCERT), representing the needs of the at-risk communities [Rapid Response Network](https://rarenet.org) member organizations serve. The extension will be built to be easily configurable for use by other organizations and communities both within and beyond these communities.

## How to use Thunderbird Suspicious Email Submitter addon 

The Suspicious Email Submitter legacy Thunderbird addon requires configuration or [a configuration file](https://github.com/CiviCERT/suspicious-email-submitter/wiki/Configuration-Files) in order to function. This can be as basic as a destination email address (entered as `mailto:email@address.com`) in the Server URL of the configuration file.

### Globally

In the global menubar there will be an entry, “SES”, with two child items: “Edit configuration” which allows you to view and edit the current configuration, and “About Suspicious Email Submitter”, which will take you to SES’s home on the web.

### Toolbars

Both the 3-pane view toolbar and the single-message-view toolbar have a button added labeled “Report via Suspicious Email Submitter”.  Once SES is configured, this button will send the email off to whatever MISP upstream has been set up.

### Context menu

In the mail context menu there’s a “Report via Suspicious Email Submitter” entry.

## Contributing: How can I build it?

You will need [Python 3.5 or later](https://www.python.org/downloads/) to build from source.

 * Download the latest [source](https://github.com/rjhansen/suspicious-email-submitter-tb/archive/master.zip) and uncompress it to a directory of your choice
 * Open a terminal window and change to that directory
 * Run `python3 ./make-xpi.py`, which will place `ses-tb.xpi` in your home directory
 * Start Thunderbird
 * Install the `.xpi` file found in your home directory
 * Restart Thunderbird
 * In `Preferences->Toolbar Layout` (`View->Toolbars->Customize` on macOS), click and drag the “Report via Suspicious Email Submitter” button where you like in your Thunderbird toolbar
 
 # License

The Suspicious Email Submitter is licensed under [GPLv3](/LICENSE).
