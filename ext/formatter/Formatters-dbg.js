/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([], function() {
	"use strict";

	var GetTimeFormat = function(sHour, sMin, sSec, iMeridiemDecider, bUpperCase) {
		var sMeridiem, sTime;
		var iHour = parseInt(sHour, 10);
		if (iHour > iMeridiemDecider) {
			iHour = iHour - iMeridiemDecider;
			sHour = iHour.toString();
			if (bUpperCase) {
				sMeridiem = "PM";
			} else {
				sMeridiem = "pm";
			}
		} else {
			if (bUpperCase) {
				sMeridiem = "AM";
			} else {
				sMeridiem = "am"; 
			}
		}
		return sTime = sHour + ":" + sMin + ":" + sSec + " " + sMeridiem;
	};

	var GetHeaderTime = function(sInspSubsetDateTime) {
		var sTimeFormat = sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyTimeFormat();
		var sHour = sInspSubsetDateTime.substring(9, 11);
		var sMin = sInspSubsetDateTime.substring(11, 13);
		var sSec = sInspSubsetDateTime.substring(13, 15);
		var sTime = "";
		switch (sTimeFormat) {
			case "0":
				sTime = sHour + ":" + sMin + ":" + sSec;
				break;
			case "1":
				sTime = GetTimeFormat(sHour, sMin, sSec, 12, true);
				break;
			case "2":
				sTime = GetTimeFormat(sHour, sMin, sSec, 12, false);
				break;
			case "3":
				sTime = GetTimeFormat(sHour, sMin, sSec, 11, true);
				break;
			case "4":
				sTime = GetTimeFormat(sHour, sMin, sSec, 11, false);
				break;
			default:
				sTime = sHour + ":" + sMin + ":" + sSec;
		}
		return sTime;
	};
	var Formatter = {

		StatusTextFormatter: function(val) {
			if (val === "1" || val === "2") {
				return this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("NotStarted");
			} else if (val === "3") {
				return this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("InProcess");
			} else if (val === "4") {
				return this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("OverDue");
			} else if (val === "5") {
				return this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("Completed");
			} else if (val === "") {
				return this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("Undefined");
			}

		},

		IconFormatter: function(val) {
			if (val === "2") {
				this.setSrc("sap-icon://past");
				this.setColor("Red");
				return "sap-icon://past";
			} else if (val === "1") {
				this.setSrc("sap-icon://future");
				this.setColor("Grey");
				return "sap-icon://future";
			} else if (val === "5") {
				return "";
			}
		},

		DcsnIcon: function(val) {
			if (val === "A") {
				return "sap-icon://accept";

			} else if (val === "R") {
				return "sap-icon://decline";
			} else {
				return "";
			}
		},

		DcsnColor: function(val) {
			if (val === "A") {
				return "Green";

			} else if (val === "R") {
				return "Red";
			} else {
				return "";
			}
		},

		StatusStateFormatter: function(val) {
			if (val === "3") {
				return "None";
			} else if (val === "4") {
				return "Warning";
			} else if (val === "2") {
				return "Error";
			} else if (val === "5") {
				return "None";
			}
		},

		DatefunctionForDraftPopOver: function(oDate) {
			var sDate = "";
			if (oDate) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					style: "medium"
				});
				sDate = oDateFormat.format(new Date(oDate));
			}
			return this.getModel('@i18n').getResourceBundle().getText("DraftPopOver", sDate);

		},

		valuationHistoryDialogTitle: function(InspOperation, OperationText) {
			if (InspOperation && OperationText) {
				return InspOperation + " " + OperationText + " " + this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle()
					.getText("ValuationHistory");
			} else if (OperationText === "" || OperationText === undefined) {
				return InspOperation + " " + this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText(
					"ValuationHistory");
			}
		},

		RadioButtonSelectionFormatter: function(sVal, sParentVal) {
			// var oRadioButtonVal = this.getParent().getBindingContext().getObject().InspSubsetUsageDcsnCode;
			if (sVal === sParentVal) {
				return true;
			} else {
				return false;
			}
		},

		DraftMarkerFunction: function(draftUUID, isActiveEntry, DraftAdministrativeData) {
			if (isActiveEntry === true && DraftAdministrativeData !== null && draftUUID === "00000000-0000-0000-0000-000000000000") {
				this.setVisible(true);
				this.setAdditionalInfo(DraftAdministrativeData.CreatedByUserDescription);
				return "LockedBy";
			} else if (draftUUID !== "00000000-0000-0000-0000-000000000000") {
				this.setVisible(true);
				return "Draft";
			} else if (draftUUID === "00000000-0000-0000-0000-000000000000") {
				this.setVisible = false;
			}

		},

		ValuationCodeRadioButtonText: function(text, code) {
			if (text !== undefined && code !== undefined) {
				return text + " " + "(" + code + ")";
			} else {
				return text;
			}
		},

		DisplayIPVisibility: function(bActiveEntity, sStatus) {
			if (sStatus === "1" || sStatus === "2") {
				return false;
			} else {
				if (!bActiveEntity) {
					return false;
				} else {
					return true;
				}
			}

		},

		EditIconVisibility: function(draftUUID, isActiveEntry, DraftAdministrativeData) {
			if (isActiveEntry === true && DraftAdministrativeData !== null && draftUUID === "00000000-0000-0000-0000-000000000000") {
				return false;
			} else {
				return true;
			}
		},

		ValuationFacetEnablement: function(bActiveEntity) {
			if (bActiveEntity) {
				return false;
			} else {
				return true;
			}
		},
		DraftTextFormatter: function(oUserName) {
			return this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText(
				"UNSAVED_CHANGES_TEXT", [oUserName]);
		},

		DraftChangeOnTextFormatter: function(oDate) {
			var day, month, year, hour, sec, mins, oFinalDate;
			day = oDate.getDate();
			month = oDate.getMonth();
			year = oDate.getFullYear();
			hour = oDate.getHours();
			sec = oDate.getSeconds();
			mins = oDate.getMinutes();
			if (day < 10) {
				day = "0" + day.toString();
			} else {
				day = day.toString();
			}
			if (month < 10) {
				month = "0" + month.toString();
			} else {
				month = month.toString();
			}
			if (hour < 10) {
				hour = "0" + hour.toString();
			} else {
				hour = hour.toString();
			}
			if (sec < 10) {
				sec = "0" + sec.toString();
			} else {
				sec = sec.toString();
			}
			if (mins < 10) {
				mins = "0" + mins.toString();
			} else {
				mins = mins.toString();
			}

			oFinalDate = day + "." + month + "." + year + " , " + hour + ":" + mins + ":" + sec;

			//	var sDate = this.convertDateIntoRequiredFormat(oDate);
			return this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("LAST_CHANGED_ON", [
				oFinalDate
			]);
		},

		DateTimeHeaderData: function(oInspSubsetDateFieldName, oInspSubsetTimeFieldName, oInspSbstDateFldProperty, oInspSbstTimeFldProperty,
			sInspSubsetDateTime) {
			if (!sInspSubsetDateTime) {
				return "";
			}
			// get date format of current user
			var sDateFormat = sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyDateFormat();
			var sYear = sInspSubsetDateTime.substring(0, 4);
			var sMonth = sInspSubsetDateTime.substring(4, 6);
			var sDay = sInspSubsetDateTime.substring(6, 8);
			var sDate = "";
			switch (sDateFormat) {
				case "1":
					sDate = sDay + "." + sMonth + "." + sYear;
					break;
				case "2":
					sDate = sMonth + "." + sDay + "." + sYear;
					break;
				case "3":
					sDate = sMonth + "-" + sDay + "-" + sYear;
					break;
				case "4":
					sDate = sYear + "." + sMonth + "." + sDay;
					break;
				case "5":
					sDate = sYear = "/" + sMonth + "/" + sDay;
					break;
				case "6":
					sDate = sYear + "-" + sMonth + "-" + sDay;
					break;
				case "7":
				case "8":
				case "9":
				case "A":
				case "B":
				case "C":
				default:
					sDate = sYear + "." + sMonth + "." + sDay;
			}
			// get time format of current user
			var sTime = GetHeaderTime(sInspSubsetDateTime);
			if (oInspSbstDateFldProperty < oInspSbstTimeFldProperty) {
				var sFormatedHeader = oInspSubsetDateFieldName + " - " + sDate + " / " + oInspSubsetTimeFieldName + " - " + sTime;
			} else if (oInspSbstTimeFldProperty < oInspSbstDateFldProperty) {
				sFormatedHeader = oInspSubsetTimeFieldName + " - " + sTime + " / " + oInspSubsetDateFieldName + " - " + sDate;
			} else {
				sFormatedHeader = oInspSubsetDateFieldName + " - " + sDate + " / " + oInspSubsetTimeFieldName + " - " + sTime;
			}
			return sFormatedHeader;
		},
		
		MaterialDescConcatenation : function(sMaterial , sMaterialName){
			if((sMaterial === undefined || sMaterial === "" || sMaterial === null) && (sMaterialName !== undefined || sMaterialName !== "" || sMaterialName !== null) ){
				return sMaterialName;
			}
			if((sMaterialName === undefined || sMaterialName === "" || sMaterialName === null ) && (sMaterial !== undefined || sMaterial !== "" || sMaterial !== null) ){
				return sMaterial;
			}
			if(sMaterialName !== "" && sMaterial !== "" && sMaterialName !== null && sMaterial !== null ){
				return sMaterial + " (" + sMaterialName + ")" ;
			}
			if(sMaterialName === null && sMaterial === null ){
				return "";
			}
		}
	};
	return Formatter;
}, true);