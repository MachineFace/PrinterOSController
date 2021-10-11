# PrinterOSController
This repo is for controlling PrinterOS with Google Apps Script.

## Author
* Cody Glen

## Table of contents
* [Authors](#authors)
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)

## General Info
This project helps manage student project submissions to PrinterOS, script updates a google sheet every 5 mins with new data, and creates printable tickets for each print. Tickets have embedded images for easier physical tracking. 
	
## Technologies
Project is created with:
* Google Apps-Script
* CLASP version: 2.3.0
	
## Setup
Create Google sheets doc, and paste code into script editor. You'll need to create triggers and point them at the 'WriteAllNewDataToSheets()' and onChange functions, and customize the code to get it to do what you want. Make sure to authorize google to be able to have it send emails.

```
$ npm install clasp gulp gulp-cli -G
$ clasp login
$ clasp clone
```
