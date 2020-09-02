/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"i2d/qm/inspsubset/resultsrecords1/ext/formatter/Formatters",
	"sap/m/MessageToast",
	"sap/i2d/qm/lib/resultsrecords1/customcontrol/CodeGroupInput",
	"sap/i2d/qm/lib/resultsrecords1/controller/rr.controller"

], function (Formatters, MessageToast, CodeGroupInput, rrController) {
	"use strict";
	return sap.ui.controller("i2d.qm.inspsubset.resultsrecords1.ext.controller.ObjectPageExt", {
		CodeGroup: CodeGroupInput,
		RR: rrController,
		oSavePayloadKeys: {
			//Some fields only for displaying, we need to ignore them when saving. 
			ignoreKeys: ["InspSpecIsQuantitative", "InspectionSpecificationText", "HasInspCharcPrtlSmpl", "InspCharacteristicSampleUnit",
				"QuantityUnit", "InspLotTestEquipInternalID", "InspectionScope", "InspectionMethod", "InspectionMethodText",
				"InspSpecDecimalPlaces", "InspSpecHasTargetValue", "InspSpecHasUpperLimit", "InspSpecHasLowerLimit", "InspectionMethodPlant",
				"InspectionSpecification", "InspectionMethodVersion", "InspCharacteristicSampleSize", "InspSpecSampleQuantityFactor",
				"InspSpecControlIndicators", "InspSpecIsMeasuredValueRqd", "InspSpecTargetValue", "InspSpecUpperLimit", "InspSpecLowerLimit",
				"InspectionSpecificationUnit", "UnitOfMeasureTechnicalName", "InspectionSpecificationPlant", "InspectionSpecificationVersion",
				"SelectedCodeSet", "SelectedCodeSetText", "InspectionResultAttributeText", "CharacteristicAttributeCodeTxt",
				"InspectionNonconformingRatio", "InspResultValueCount", "InspSpecImportanceCode", "InspSpecImportanceCodeText",
				"InspResultIsDocumentationRqd", "InspCharAcceptedCount", "InspCharRejectedCount", "InspectionResultStatusText", "CharcStatusName",
				"SiblingEntity", "to_History", "to_InspCharcSubsetResults", "to_InspectionResultValue", "to_ResultDetails",
				"InspectionValuationResultText",
				"IsEditable", "ValuationErrorMessage", "IsQual", "decimalPlaces", "IsSum", "IsWithCode", "IsMeasure", "IsUpper", "IsLower",
				"HasTarget",
				"TemplateId", "RemarkErrorMessage",
				"IsDataChanged", "CodeGroupCodeValuation", "CodeGroupCodeErrorMessage"
			]
		},
		inspectionPointPageId: "i2d.qm.inspsubset.resultsrecords1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_InspLotRsltRec",
		resultRecordingPageId: "i2d.qm.inspsubset.resultsrecords1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_InspSubsetRsltRec",
		onInit: function (oEvent) {
			var that = this;
			//	this.aToPushDataToInspResultValue = [];
			/* For Differentiating between Object Page 1 getting loaded or Object Page 2 
			   Since both the pages have different controls 
			*/
			if (this.getView().getId() === that.inspectionPointPageId) {
				this._ignoreFieldsForSmartTable();
			} else {
				this.extensionAPI.registerMessageFilterProvider(that._errorMessageFunction, that);
			}
			/* Every Time this function is called
			when ever we reach Details Page 1 or Details Page 2 */
			this.extensionAPI.attachPageDataLoaded(function (oEvent) {
				if (oEvent.context.sPath.indexOf("InspPlanOperationInternalID") >= 0) {
					sap.ui.getCore().getMessageManager().removeAllMessages();
					/* Fetching the data for RR Table */
					that._getRRData(oEvent.context);
				}
				/* After coming from Object Page 2 to Object Page 1 we need to rebind the Table */
				else {
					var oSmartTable = that.getView().byId("inspectionPointSmartTable");
					if (oSmartTable) {
						oSmartTable.rebindTable();
					}
				}
				/* For Displaying Message Toast of Changes Saved or Draft Discarded on coming from Object Page 2 to Object Page 1 */
				if (sap.ui.getCore().byId(that.resultRecordingPageId)) {
					var objectPage2View = sap.ui.getCore().byId(that.resultRecordingPageId);
					var objectPage2Controller = objectPage2View.getController();
					if (objectPage2Controller.IpSaved === true) {
						MessageToast.show(that.getOwnerComponent().getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspSubsetRsltRec").getResourceBundle()
							.getText("MSG_CHANGES_SAVED"));
						objectPage2Controller.IpSaved = false;
					} else if (objectPage2Controller.IpDeleted === true) {
						MessageToast.show(that.getOwnerComponent().getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspSubsetRsltRec").getResourceBundle()
							.getText("MSG_CHANGES_DELETED"));
						objectPage2Controller.IpDeleted = false;
					}
				}
			}, that);
		},

		/* To Reduce the Space between the table and the Header Section */
		onBeforeRendering: function () {
			var oPageSection = sap.ui.getCore().byId(this.createId("to_InspSubsetRsltRec::com.sap.vocabularies.UI.v1.LineItem::Section"));
			if (oPageSection) {
				oPageSection.addStyleClass("sapUiNoMarginTop");
			}
		},

		_errorMessageFunction: function () {
			var aFilter = [];
			var oFilter = new sap.ui.model.Filter("message", sap.ui.model.FilterOperator.NE, "");
			aFilter.push(oFilter);
			return aFilter;
		},

		/* To get the table showing the Inspection Point History Table in Object Page 1 */
		onPressValuationHistory: function (oEvent) {
			if (!this.valuationHistoryDialog) {
				this.valuationHistoryDialog = sap.ui.xmlfragment("valuationHistoryDialog",
					"i2d.qm.inspsubset.resultsrecords1.ext.fragment.valuationHistory", this);
				this.getView().addDependent(this.valuationHistoryDialog);
			}
			this.valuationHistoryDialog.setBindingContext(oEvent.getSource().getBindingContext());
			this.valuationHistoryDialog.open();
		},

		onCloseValuationHistory: function (oEvent) {
			this.valuationHistoryDialog.close();
		},

		/* While clicking on Not Started Inspection Point we create Draft Entry and Navigate to Object Page 2
		 * oData - Data of the row that has been clicked
		 * oViewData - To get the value for InspectionOperations
		 * oEvent - On click Event of the row
		 */
		_createIP: function (oData, oViewData, oEvent) {
			this.oViewData = oViewData;
			var that = this;
			var oDataToBeCreated = {
				DraftUUID: oData.DraftUUID,
				IsActiveEntity: false,
				InspectionLotForEdit: oData.InspectionLot,
				InspectionOperationForEdit: oData.InspPlanOperationInternalID,
				InspectionSubsetDate: oData.InspectionSubsetDate,
				InspectionSubsetTime: oData.InspectionSubsetTime,
				InspectionOperations: oData.InspectionOperation,
				InspSubsetStatus: oData.InspSubsetStatus,
				WorkCenter: oData.WorkCenter,
				InspSubsetAcceptedCount: oData.InspSubsetAcceptedCount,
				InspSubsetRejectedCount: oData.InspSubsetRejectedCount
			};
			sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel().create("/C_InspSubsetRsltRec", oDataToBeCreated, {
				success: $.proxy(function (oResponse) {
					sap.ui.core.BusyIndicator.hide();
					this._navigateToResultRecordingPage(oResponse, that.oViewData, false);
				}, this),
				error: $.proxy(function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this._showErrorMessage(oError);
				}, this)
			});
		},

		/* Clicking on Inspection Point with status apart from NOT STARTED and for which Draft does not exist
		 * oData - Data of the row that has been clicked
		 * oViewData - To get the value for InspectionOperations
		 */
		_onEditIP: function (oData, oViewData) {
			this.oViewData = oViewData;
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			// setTimeout(jQuery.proxy(function() {
			var urlParameters = {
			//	PreserveChanges: true,
				InspectionLot: oData.InspectionLot,
				InspectionSubsetInternalID: oData.InspectionSubsetInternalID,
				InspPlanOperationInternalID: oData.InspPlanOperationInternalID,
				DraftUUID: oData.DraftUUID,
				IsActiveEntity: oData.IsActiveEntity
			};
			// this.getOwnerComponent().getModel().callFunction("/C_InspSubsetRsltRecEdit", {
			// 	urlParameters: urlParameters,
			// 	method: "POST",
			// 	success: $.proxy(function (oResult, oResponse) {
			// 				sap.ui.core.BusyIndicator.hide();
			// 	that._navigateToResultRecordingPage(oResponse[0].response.data,	that.oViewData,false);
			// 	}, this),
			// 	error: $.proxy(function (oError) {
			// 		sap.ui.core.BusyIndicator.hide();	
			// 	}, this)
			// });
			var oPromise = this.extensionAPI.invokeActions("/C_InspSubsetRsltRecEdit", [], urlParameters);
			oPromise.then(function(oResponse) {
				sap.ui.core.BusyIndicator.hide();
				that._navigateToResultRecordingPage(oResponse[0].response.data,	that.oViewData,false);
			}, function(oError) {
				sap.ui.core.BusyIndicator.hide();
			});
		},

		/* Fetching the data for RR Table
		 * context - attachPageDataLoaded oEvent context
		 */
		_getRRData: function (context) {
			var oDataService = this.getOwnerComponent().getModel().sServiceUrl;
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			//		setTimeout(jQuery.proxy(function() {
			var ViewId = this.byId("resultsRecordLibraryView");
			if (ViewId) {
				var tableId = ViewId.createId("QR_RR_CHARAC_TABLE");
				this.oController = ViewId.getController();
			}
			//	ViewId.byId(tableId).setBindingContext(context);
			var oContextData = context.getObject();
			var readCall = this.getOwnerComponent().getModel().createKey("C_InspSubsetRsltRec", {
				InspectionLot: oContextData.InspectionLot,
				InspectionSubsetInternalID: oContextData.InspectionSubsetInternalID,
				InspPlanOperationInternalID: oContextData.InspPlanOperationInternalID,
				DraftUUID: oContextData.DraftUUID,
				IsActiveEntity: oContextData.IsActiveEntity
			});
			var oreadCallPath = "/" + readCall;
			this.getOwnerComponent().getModel().read(oreadCallPath, {
				urlParameters: {
					"$expand": "to_InspSubsetCharcResult,to_InspSubsetCharcResult/to_InspectionResultValue,to_ValuationCodes"
				},
				success: (function (oResult) {
					// var oConcatedResponse.results = oConcatedResponse.results.concat(oRes.results);
					if (!this.oValuationFacetModel) {
						this.oValuationFacetModel = new sap.ui.model.json.JSONModel();
						this.getView().setModel(this.oValuationFacetModel, "valuationFacet");
					}
					this.oValuationFacetModel.setData(oResult.to_ValuationCodes);
					var oConcatedResponse = oResult.to_InspSubsetCharcResult;
					// Copy details results as binding data for Multiinput.
					// This is to fix the problem that the size of tokens increases automatically after changing any fields of model
					oConcatedResponse.results.forEach(function (item) {
						if (item.IsActiveEntity === true) {
							item.Displayonly = "X";
						}
						if (item.InspectionResultStatus === "0") {
							item.InspectionResultStatusText = item.CharcStatusName;
						}
						if (item.InspResultValidValuesNumber === 0 || item.InspResultValidValuesNumber === "" || item.InspResultValidValuesNumber ===
							null) {
							item.InspResultValidValuesNumber = 0;
						} else {
							item.InspResultValidValuesNumber = parseFloat(item.InspResultValidValuesNumber);
						}
						switch (item.InspectionValuationResult) {
						case "A":
							item.InspectionValuationResultText = this.getOwnerComponent().getModel(
								"i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("Accept");
							break;
						case "R":
							item.InspectionValuationResultText = this.getOwnerComponent().getModel(
								"i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("Reject");
							break;
						case "F":
							item.InspectionValuationResultText = this.getOwnerComponent().getModel(
								"i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("Failed");
							break;
						default:
							item.InspectionValuationResultText = "";
						}
						if (item.InspSpecIsQuantitative === true) {
							item.InspSpecIsQuantitative = "1";
						} else {
							item.InspSpecIsQuantitative = "0";
						}
						if (item.InspSpecIsLongTermInspection === "X") {
							item.InspSpecIsLongTermInspection = "1";
						} else {
							item.InspSpecIsLongTermInspection = "";
						}
						switch (item.InspSpecRecordingType) {
						case "+":
							item.InspSpecRecordingType = "1";
							break;
						case "-":
							item.InspSpecRecordingType = "2";
							break;
						default:
							item.InspSpecRecordingType = "";
						}
						switch (item.InspSpecCharcCategory) {
						case "X":
							item.InspSpecCharcCategory = "1";
							break;
						case "":
							item.InspSpecCharcCategory = "2";
							break;
						default:
							item.InspSpecCharcCategory = "";
						}
						switch (item.InspSpecResultCalculation) {
						case "X":
							item.InspSpecResultCalculation = "1";
							break;
						case "1":
							item.InspSpecResultCalculation = "2";
							break;
						default:
							item.InspSpecResultCalculation = "";
						}
						item.to_ResultDetails = JSON.parse(JSON.stringify(item.to_InspectionResultValue));
						item.to_History = item.to_InspCharcSubsetResults;
						if (!item.to_ResultDetails) {
							item.to_ResultDetails = {
								results: []
							};
						}
						item.to_ResultDetails.results4Binding = [];
						// Copy results array to results4Binding
						Array.prototype.push.apply(item.to_ResultDetails.results4Binding,
							item.to_ResultDetails.results.filter(function (oRes) {
								return oRes.Inspectionvaluationresult !== "F";
							}));
					}, this);
					sap.ui.core.BusyIndicator.hide();
					/* Sending the data to the Reusable Library*/
					this.oController.onCharInfoRequestSuccess(oConcatedResponse, tableId, this.getOwnerComponent().getModel(
							"i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("TableHeadingItems"),
						this, oDataService);

				}).bind(that),
				error: (function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this._showErrorMessage(oError);
				}).bind(this)
			});
			//	}, this), 0);
		},

		getCharacValuationData: function (oBindingObject) {
			var that = this;
			var aFilter = [];
			var oFilter = {};
			oFilter = new sap.ui.model.Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, oBindingObject.InspectionLot);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("InspPlanOperationInternalID", sap.ui.model.FilterOperator.EQ, oBindingObject.InspPlanOperationInternalID);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("InspectionCharacteristic", sap.ui.model.FilterOperator.EQ, oBindingObject.InspectionCharacteristic);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("InspectionSubsetInternalID", sap.ui.model.FilterOperator.EQ, oBindingObject.InspectionSubsetInternalID);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("IsActiveEntity", sap.ui.model.FilterOperator.EQ, oBindingObject.IsActiveEntity);
			aFilter.push(oFilter);
			this.getOwnerComponent().getModel().read("/C_InspSubsetCharcResult", {
				filters: aFilter,
				urlParameters: {
					"$skip": "0",
					"$top": "10",
					"$expand": "to_InspCharcSubsetResults"
				},
				success: (function (oResult) {
					/* Sending the data to the Reusable Library*/
					this.oController._showingChartForCharacHistory(oResult.results[0]);
				}).bind(that),
				error: (function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this._showErrorMessage(oError);
				}).bind(this)
			});
		},
		/* Getting Data from Reusable Library to this method 
		 * oPayload - Data coming from RR Table from Re-usbale Library
		 */
		onLoseFocusData: function (oPayload, isSingleResult, aTokenRemoved, aTokenAdded) {
			var bSingleResultFlag = false;
			this.getView().setBusy(true);
			var oData = {};
			var that = this;
			$.each(oPayload[0].value, function (i, currProgram) {
				if (that.oSavePayloadKeys.ignoreKeys.indexOf(i) === -1) {
					oData[i] = currProgram;
				}
			});
			if (oPayload[0].value.to_ResultDetails.results.length > 0 || oPayload[0].value.to_InspectionResultValue.results.length > 0) {
				if (!isSingleResult) {
					bSingleResultFlag = false;
				} else {
					bSingleResultFlag = true;
					this._handleSingleResult(oPayload[0].value, oData, aTokenRemoved, aTokenAdded);
				}
			}
			if (bSingleResultFlag === false) {
				var oPath = this.getOwnerComponent().getModel().createKey("C_InspSubsetCharcResult", {
					InspectionLot: oData.InspectionLot,
					InspectionSubsetInternalID: oData.InspectionSubsetInternalID,
					InspPlanOperationInternalID: oData.InspPlanOperationInternalID,
					InspectionCharacteristic: oData.InspectionCharacteristic,
					DraftUUID: oData.DraftUUID,
					IsActiveEntity: oData.IsActiveEntity
				});
				oPath = "/" + oPath;
				this.extensionAPI.getTransactionController().saveDraft(this._updateRRData(oPath, oData));
			}
		},

		/* Updating the data 
		 * oPath - Path to which update needs to be done
		 * oData - Data to be sent
		 */
		_updateRRData: function (oPath, oData) {
			this.getOwnerComponent().getModel().update(oPath, oData, {
				success: $.proxy(function (oResult, oResponse) {
					this.getView().setBusy(false);
					this.hasChanges = false;
					this.objectPage2View = sap.ui.getCore().byId(this.resultRecordingPageId);
					if (this.objectPage2View) {
						this.objectPage2View.byId("SaveButton").setEnabled(true);
					}
				}, this),
				error: $.proxy(function (oError) {
					this.getView().setBusy(false);
					this.hasChanges = false;
					this.objectPage2View = sap.ui.getCore().byId(this.resultRecordingPageId);
					if (this.objectPage2View) {
						this.objectPage2View.byId("SaveButton").setEnabled(true);
					}
				}, this)
			});

		},

		/* For Saving Single Result to the Draft 
		 * oDataFromLib - Data coming from the RR Table from Re-usable Library - Child Entity Data
		 * oParentData - Data after the not required attributes have been removed - Parent Entity Data
		 */
		_handleSingleResult: function (oDataFromLib, oParentData, aTokenRemoved, aTokenAdded) {
			var bAlreadyCreatedToken = false;
			this.onLoseFocusDataResponse = oParentData;
			this.oDataFromLib = oDataFromLib;
			var that = this;
			// var bDelete = false;
			var bIsAvailable = false;
			if (aTokenRemoved.length > 0) {
				for (var j = 0; j < this.oDataFromLib.to_InspectionResultValue.results.length; j++) {
					bIsAvailable = false; // Is Token available in result details?if not then delete it
					for (var k = 0; k < this.oDataFromLib.to_ResultDetails.results.length; k++) {
						if (parseInt(this.oDataFromLib.to_ResultDetails.results[k].InspResultItemInternalID, 10) === parseInt(this.oDataFromLib.to_InspectionResultValue
								.results[j].InspResultItemInternalID, 10)) {
							bIsAvailable = true;
							break;
						}
					}
					if (!bIsAvailable) {
						// bDelete = true;
						this._handleDeleteSingleResult(this.oDataFromLib.to_InspectionResultValue.results[j]);
						this.oDataFromLib.to_InspectionResultValue.results.splice(j, 1);
						j--;
						//	break;  // NOT SURE THIS IS NEEDED ..... SO THAT IF 2 TOKENS ARE DELETED BOTH CALLS GO
					}
				}
			}
			if (aTokenAdded.length > 0) {
				var oPath = this.getOwnerComponent().getModel().createKey("C_InspSubsetCharcResult", {
					InspectionLot: this.oDataFromLib.InspectionLot,
					InspectionSubsetInternalID: this.oDataFromLib.InspectionSubsetInternalID,
					InspPlanOperationInternalID: this.oDataFromLib.InspPlanOperationInternalID,
					InspectionCharacteristic: this.oDataFromLib.InspectionCharacteristic,

					DraftUUID: this.oDataFromLib.DraftUUID,
					IsActiveEntity: this.oDataFromLib.IsActiveEntity
				});
				oPath = "/" + oPath + "/to_InspectionResultValue";
				this._updateParentEntityForSingleResult(this.onLoseFocusDataResponse);
				for (var i = 0; i < this.oDataFromLib.to_ResultDetails.results.length; i++) {
					bAlreadyCreatedToken = false;
					for (j = 0; j < this.oDataFromLib.to_InspectionResultValue.results.length; j++) {
						if (parseInt(this.oDataFromLib.to_ResultDetails.results[i].InspResultItemInternalID, 10) === parseInt(this.oDataFromLib.to_InspectionResultValue
								.results[j].InspResultItemInternalID, 10)) {
							bAlreadyCreatedToken = true;
							break;
						}
					}
					if (!bAlreadyCreatedToken) {
						var oDataToBeCreated = {
							InspectionLot: this.oDataFromLib.to_ResultDetails.results[i].InspectionLot,
							InspectionSubsetInternalID: this.oDataFromLib.to_ResultDetails.results[i].InspectionSubsetInternalID,
							InspPlanOperationInternalID: this.oDataFromLib.to_ResultDetails.results[i].InspPlanOperationInternalID,
							InspectionCharacteristic: this.oDataFromLib.to_ResultDetails.results[i].InspectionCharacteristic,
							ParentDraftUUID: this.oDataFromLib.to_ResultDetails.results[i].DraftUUID,
							IsActiveEntity: this.oDataFromLib.to_ResultDetails.results[i].IsActiveEntity,
							InspectionResultMeasuredValue: Number(this.oDataFromLib.to_ResultDetails.results[i].InspectionResultMeasuredValue),
							InspectionResultOriginalValue: this.oDataFromLib.to_ResultDetails.results[i].InspectionResultOriginalValue,
							InspResultItemInternalID: "" + this.oDataFromLib.to_ResultDetails.results[i].InspResultItemInternalID,
							InspectionValuationResult: this.oDataFromLib.to_ResultDetails.results[i].InspectionValuationResult,
							CharacteristicAttributeCode: this.oDataFromLib.to_ResultDetails.results[i].CharacteristicAttributeCode,
							CharacteristicAttributeCodeGrp: this.oDataFromLib.to_ResultDetails.results[i].CharacteristicAttributeCodeGrp
						};
						this.bSingleResultFlag = true;
						this.getOwnerComponent().getModel().create(oPath, oDataToBeCreated, {
							success: $.proxy(function (oRes) {
								that.getView().setBusy(false);
								this.oDataFromLib.to_InspectionResultValue.results.push(oRes); // So that now the Tokens are created so on deleating , they shuld be removed from draft too.
								//		this.oDataFromLib.to_ResultDetails.results.push(oRes);
							}, this),
							error: $.proxy(function (oError) {
								that.getView().setBusy(false);
								this._showErrorMessage(oError);
							}, this)
						});
					}
				}

			}
		},

		/* Updating Parent Entity in case of Single Results 
		 * oData - Data that needs to be updated
		 */
		_updateParentEntityForSingleResult: function (oData) {
			var oPath = this.getOwnerComponent().getModel().createKey("C_InspSubsetCharcResult", {
				InspectionLot: oData.InspectionLot,
				InspectionSubsetInternalID: oData.InspectionSubsetInternalID,
				InspPlanOperationInternalID: oData.InspPlanOperationInternalID,
				InspectionCharacteristic: oData.InspectionCharacteristic,
				DraftUUID: oData.DraftUUID,
				IsActiveEntity: oData.IsActiveEntity
			});
			oPath = "/" + oPath;
			this.extensionAPI.getTransactionController().saveDraft(this._updateRRData(oPath, oData));
		},

		/* Deleting Single Results from the Draft
		 * oData - Data that needs to be updated
		 */
		_handleDeleteSingleResult: function (oData) {
			var oCPath = this.getOwnerComponent().getModel().createKey("C_InspSubsetResultValue", {
				InspectionLot: oData.InspectionLot,
				InspectionSubsetInternalID: oData.InspectionSubsetInternalID,
				InspPlanOperationInternalID: oData.InspPlanOperationInternalID,
				InspectionCharacteristic: oData.InspectionCharacteristic,
				InspResultValueInternalID: oData.InspResultValueInternalID,
				DraftUUID: oData.DraftUUID,
				IsActiveEntity: false
			});
			oCPath = "/" + oCPath;
			oData.InspectionResultAttribute = "/";
			this.getView().setBusy(false);
			this.getOwnerComponent().getModel().update(oCPath, oData, {
				success: $.proxy(function (oResult, oResponse) {
					this.getView().setBusy(false);
					this.hasChanges = false;
					this.objectPage2View = sap.ui.getCore().byId(this.resultRecordingPageId);
					if (this.objectPage2View) {
						this.objectPage2View.byId("SaveButton").setEnabled(true);
					}
				}, this),
				error: $.proxy(function (oError) {
					this.getView().setBusy(false);
					this.hasChanges = false;
					this.objectPage2View = sap.ui.getCore().byId(this.resultRecordingPageId);
					if (this.objectPage2View) {
						this.objectPage2View.byId("SaveButton").setEnabled(true);
					}
				}, this)
			});
		},

		/* Rebind Function for Inspection Point Table in Details Page 1 */
		onInspPointBeforeRebind: function (oEvent) {
			var oViewData = this.getView().getBindingContext().getObject();
			var aOperations = oViewData.InspectionOperations.split(",");
			var oFilter = {};
			var oBindingParams = oEvent.getParameter("bindingParams");
			oFilter = new sap.ui.model.Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, oViewData.InspectionLot);
			oBindingParams.filters.push(oFilter);
			oFilter = new sap.ui.model.Filter("IsActiveEntity", sap.ui.model.FilterOperator.EQ, true);
			oBindingParams.filters.push(oFilter);
			oFilter = new sap.ui.model.Filter("IsActiveEntity", sap.ui.model.FilterOperator.EQ, false);
			oBindingParams.filters.push(oFilter);
			oBindingParams.parameters.expand = "DraftAdministrativeData";
			aOperations.forEach(function (op) {
				oFilter = new sap.ui.model.Filter("InspectionOperation", sap.ui.model.FilterOperator.EQ, op);
				oBindingParams.filters.push(oFilter);
			});
			if (oBindingParams.parameters.select) {
				oBindingParams.parameters.select = oBindingParams.parameters.select +
					",InspSubsetUsageDcsnCodeGroup,DraftEntityLastChangeDateTime,DraftAdministrativeData/CreationDateTime,DraftAdministrativeData/LastChangeDateTime,DraftUUID,IsActiveEntity,InspSubsetTimeIntervalUnit,InspSubsetTimeInterval,InspPlanOperationInternalID,InspectionSubsetInternalID,InspectionLot,InspectionOperation,WorkCenter,InspSubsetUsageDcsnCode,InspSubsetUsageDcsnValuation,InspSubsetCharcOpenCount,InspSubsetCharcAcceptedCount,InspectionSubsetTime,InspectionSubsetDate,InspSubsetCharcRejectedCount,InspSubsetStatus,InspSubsetAcceptedCount,InspSubsetRejectedCount,DraftAdministrativeData/CreatedByUserDescription,DraftAdministrativeData/DraftIsProcessedByMe,DraftAdministrativeData/LastChangedByUserDescription,DraftAdministrativeData/DraftIsKeptByUser,DraftAdministrativeData/DraftUUID,DraftAdministrativeData/CreatedByUser"; //,DateAndTime
			} else {
				oBindingParams.parameters.select =
					"InspSubsetUsageDcsnCodeGroup,DraftEntityLastChangeDateTime,DraftUUID,DraftAdministrativeData/CreationDateTime,DraftAdministrativeData/LastChangeDateTime,IsActiveEntity,InspSubsetTimeIntervalUnit,InspSubsetTimeInterval,InspPlanOperationInternalID,InspectionSubsetInternalID,InspectionLot,InspectionOperation,WorkCenter,InspSubsetUsageDcsnCode,InspSubsetUsageDcsnValuation,InspSubsetCharcOpenCount,InspSubsetCharcAcceptedCount,InspectionSubsetTime,InspectionSubsetDate,InspSubsetCharcRejectedCount,InspSubsetStatus,InspSubsetAcceptedCount,InspSubsetRejectedCount,DraftAdministrativeData/CreatedByUserDescription,DraftAdministrativeData/DraftIsProcessedByMe,DraftAdministrativeData/LastChangedByUserDescription,DraftAdministrativeData/DraftIsKeptByUser,DraftAdministrativeData/DraftUUID,DraftAdministrativeData/CreatedByUser"; //,DateAndTime	
			}
			oBindingParams.parameters = oBindingParams.parameters || {};
			var column = oEvent.getSource().getTable().getColumns();
			column[0].setMergeFunctionName("getTitle");
			column[0].setMergeDuplicates(true);
		},

		/* On Press of Display Icon on the Inspection Point Table */
		onInspectionPointPress: function (oEvent) {
			var oViewData = this.getView().getBindingContext().getObject();
			var oRowData = oEvent.getSource().getBindingContext().getObject();
			this._navigateToResultRecordingPage(oRowData, oViewData, true);
		},

		/* On Press of Edit Icon on the Inspection Point Table */
		onInpectionPointEditPress: function (oEvent) {
			var oViewData = this.getView().getBindingContext().getObject();
			var oRowData = oEvent.getSource().getBindingContext().getObject();
			if (oRowData.DraftUUID === "00000000-0000-0000-0000-000000000000") {
				if (oRowData.InspSubsetStatus === "1" || oRowData.InspSubsetStatus === "2") {
					this._createIP(oRowData, oViewData, oEvent); //For Creating Inspection Point
				} else {
					this._onEditIP(oRowData, oViewData); //For createing draft UUUID  
				}
			} else {
				this._navigateToResultRecordingPage(oRowData, oViewData, true);
			}
		},

		/* On Saving the Valuation Facet Data to the Draft */
		onValuationSelection: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				var oSelectedData = oEvent.getSource().getBindingContext("valuationFacet").getObject();
				var oData = this.getView().getBindingContext().getObject();
				var oPath = this.getOwnerComponent().getModel().createKey("C_InspSubsetRsltRec", {
					InspectionLot: oData.InspectionLot,
					InspectionSubsetInternalID: oData.InspectionSubsetInternalID,
					InspPlanOperationInternalID: oData.InspPlanOperationInternalID,
					DraftUUID: oData.DraftUUID,
					IsActiveEntity: false
				});
				oPath = "/" + oPath;
				this.getOwnerComponent().getModel().setProperty(oPath + "/InspSubsetUsageDcsnCode", oSelectedData.UsageDecisionCode);
				this.getOwnerComponent().getModel().setProperty(oPath + "/InspSubsetUsageDcsnCodeGroup", oSelectedData.UsageDecisionCodeGroup);
				this.extensionAPI.getTransactionController().executeSideEffects();
			}
		},

		onPressCancelDraft: function (oEvent) {
			if (!this.DiscardDraftPopOver) {
				this.DiscardDraftPopOver = sap.ui.xmlfragment("discardDraftPopover",
					"i2d.qm.inspsubset.resultsrecords1.ext.fragment.DiscardPopOver", this);
				this.getView().addDependent(this.DiscardDraftPopOver);
			}
			var oButton = oEvent.getSource();
			this.DiscardDraftPopOver.openBy(oButton);
		},

		onDiscardPress: function () {
			this.IpDeleted = false;
			var oPath = this.getView().getBindingContext().sPath;
			this.getOwnerComponent().getModel().remove(oPath, {
				success: $.proxy(function (oResult, oResponse) {
					var oHistory = sap.ui.core.routing.History.getInstance();
					var sPreviousHash = oHistory.getPreviousHash();
					if (sPreviousHash !== undefined) {
						this.IpDeleted = true;
						window.history.go(-1);
					} else {
						var oRouter = this.getOwnerComponent().getRouter();
						oRouter.navTo("root", null, true);
					}
				}, this),
				error: $.proxy(function (oError) {
					this.IpDeleted = false;
					this._showErrorMessage(oError);
				}, this)
			});
		},

		/* On Pressing the Save Button on Detail Page 2 */
		onPressSaveActive: function (oEvent) {
			var that = this;
			this.IpSaved = false;
			this.getView().setBusy(true);
			var oData = this.getView().getBindingContext().getObject();
			var urlParameters = {
				InspectionLot: oData.InspectionLot,
				InspPlanOperationInternalID: oData.InspPlanOperationInternalID,
				InspectionSubsetInternalID: oData.InspectionSubsetInternalID,
				DraftUUID: oData.DraftUUID,
				IsActiveEntity: oData.IsActiveEntity
			};
			var oPromise = this.extensionAPI.invokeActions("/C_InspSubsetRsltRecActivation", [], urlParameters);
			oPromise.then(function () {
				that.getView().setBusy(false);
				var oHistory = sap.ui.core.routing.History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();
				if (sPreviousHash !== undefined) {
					that.IpSaved = true;
					window.history.go(-1);
				} else {
					var oRouter = that.getOwnerComponent().getRouter();
					oRouter.navTo("root", null, true);
				}
			}, function (oError) {
				that.IpSaved = false;
				that.getView().setBusy(false);
				// that._showErrorMessage(oError[0].error.response.responseText, true);
			});
		},

		onDraftMarkerPress: function (oEvent) {
			if (oEvent.getParameters().type !== "LockedBy") {
				if (!this.DraftDetailsPopOver) {
					this.DraftDetailsPopOver = sap.ui.xmlfragment("DraftDetailsPopOver",
						"i2d.qm.inspsubset.resultsrecords1.ext.fragment.DraftPopOver", this);
					this.getView().addDependent(this.DraftDetailsPopOver);
				}
				this.DraftDetailsPopOver.setBindingContext(oEvent.getSource().getBindingContext());
				var oButton = oEvent.getSource();
				this.DraftDetailsPopOver.openBy(oButton);
			} else if (oEvent.getParameters().type === "LockedBy") {
				if (!this.businessCardPopOver) {
					this.businessCardPopOver = sap.ui.xmlfragment("businessCard",
						"i2d.qm.inspsubset.resultsrecords1.ext.fragment.businessCardPopOver", this);
					this.businessCardPopOver.setBindingContext(oEvent.getSource().getBindingContext());
					this.getView().addDependent(this.businessCardPopOver);
				}
				this.businessCardPopOver.setBindingContext(oEvent.getSource().getBindingContext());
				this.businessCardPopOver.openBy(oEvent.getSource());
			}
		},

		getCodeGroupDataForLibrary: function (oData, callback) {
			var CodeGroup = new CodeGroupInput();
			var aFilter = [];
			var oFilter = {};
			if (oData.SelectedCodeSetPlant !== "") {
				oFilter = new sap.ui.model.Filter("SelectedCodeSetPlant", sap.ui.model.FilterOperator.EQ, oData.SelectedCodeSetPlant);
				aFilter.push(oFilter);
			}
			if (oData.SelectedCodeSet !== "") {
				oFilter = new sap.ui.model.Filter("SelectedCodeSet", sap.ui.model.FilterOperator.EQ, oData.SelectedCodeSet);
				aFilter.push(oFilter);
			}
			oFilter = new sap.ui.model.Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, oData.InspectionLot);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("InspPlanOperationInternalID", sap.ui.model.FilterOperator.EQ, oData.InspPlanOperationInternalID);
			aFilter.push(oFilter);
			oFilter = new sap.ui.model.Filter("InspectionCharacteristic", sap.ui.model.FilterOperator.EQ, oData.InspectionCharacteristic);
			aFilter.push(oFilter);
			this.getOwnerComponent().getModel().read("/C_Chargroupcode_Valuehelp", {
				filters: aFilter,
				sorters: [new sap.ui.model.Sorter("CharacteristicAttributeCode", false)],
				success: (function (oResponse) {
					//had requested data putting in an object to avoid requesting repeatedly.
					CodeGroup.setvHMapModel(callback, oResponse);
				}).bind(this),
				error: (function (oResponse) {
					//had requested data putting in an object to avoid requesting repeatedly.
					this._vHMap = oResponse;
				}).bind(this)
			});
		},

		/* These fields are not required in the Personalisation Dialog */
		_ignoreFieldsForSmartTable: function () {
			var oSmartTable = this.byId("inspectionPointSmartTable");
			var sIgnoredFields =
				"CreatedByUser,MaterialName,InspectionOperationForEdit,InspectionSubsetDate,InspectionSubsetInternalID,InspPlanOperationInternalID,SelectedCodeSet,InspectionLotForEdit,InspSpecAddlSeldCodeSetPlant,InspSubsetTimeInterval,InspSpecAdditionalSelectedSet,InspSubsetTimeIntervalUnit,InspectionSubsetSortKey,InspSubsetUsageDcsnCodeGroup,InspLotUsgeDcsnValuationText,InspSubsetUsageDcsnCode,InspSubsetUsageDcsnValuation,InspSbstTimeFldProperty,InspectionSubsetTime,InspectionSubsetDate,InspSbstLongNmbrFldProperty,InspSbstDateFldProperty,InspSubsetLongNumericKey,InspSubsetShortNumericKey,InspSbstShrtNmbrFldProperty,InspectionSubsetLongCharKey,InspSbstLongTxtFldProperty,InspectionSubsetShortCharKey,InspSbstShrtTxtFldProperty,LastChangeDate,InspSubsetFieldCombination,SelectedCodeSet,SelectedCodeSetPlant,LastChangedByUser,CreationTime,CreationDate,LastChangedByUser,CreatedByUser,LastChangeTime,LastChangeDate,LastChangedByUser,InspSubsetDateFieldName,InspSubsetTimeFieldName,InspSubsetCharcRejectedCount,InspSubsetCharcAcceptedCount,InspSubsetCharcOpenCount,InspSubsetRejectedCount,InspSubsetAcceptedCount,InspectionLot,InspectionOperations,Inspector,Material,Plant";
			oSmartTable.setIgnoredFields(sIgnoredFields);
		},

		_showErrorMessage: function (oError, bInvokeAction) {
			if (bInvokeAction) {
				var jsonText = JSON.parse(oError);
				sap.m.MessageBox.error(
					jsonText.error.message.value
				);
			} else {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				sap.m.MessageBox.error(
					JSON.parse(oError.responseText).error.message.value, {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
			}
		},

		onCloseDraftUnsavedChangesPopOver: function (oEvent) {
			if (!this.businessCardPopOver) {
				this.businessCardPopOver = sap.ui.xmlfragment("businessCard",
					"i2d.qm.inspsubset.resultsrecords1.ext.fragment.businessCardPopOver", this);
				this.getView().addDependent(this.businessCardPopOver);
			}
			this.businessCardPopOver.close();
		},

		/* Navigation to the Result Recording page 
		 * oData - Data to be used for entering keys
		 * oViewData - In case Draft is already there we need to send InspectionOperations as well
		 */
		_navigateToResultRecordingPage: function (oData, oViewData, isActiveEntryFlag) {
			if (oViewData && isActiveEntryFlag === true) {
				this.getView().getController().getOwnerComponent().getRouter().navTo("C_InspLotRsltRec/to_InspSubsetRsltRec", {
					keys1: "InspectionLot='" + oData.InspectionLot + "',InspectionOperations='" + oViewData.InspectionOperations + "'",
					keys2: "InspectionLot='" + oData.InspectionLot + "',InspectionSubsetInternalID='" + oData.InspectionSubsetInternalID +
						"',InspPlanOperationInternalID='" + oData.InspPlanOperationInternalID + "',DraftUUID=guid'" + oData.DraftUUID +
						"',IsActiveEntity=" + oData.IsActiveEntity
				}, false);
			} else {
				this.getView().getController().getOwnerComponent().getRouter().navTo("C_InspLotRsltRec/to_InspSubsetRsltRec", {
					keys1: "InspectionLot='" + oData.InspectionLot + "',InspectionOperations='" + oViewData.InspectionOperations + "'",
					keys2: "InspectionLot='" + oData.InspectionLot + "',InspectionSubsetInternalID='" + oData.InspectionSubsetInternalID +
						"',InspPlanOperationInternalID='" + oData.InspPlanOperationInternalID + "',DraftUUID=guid'" + oData.DraftUUID +
						"',IsActiveEntity=false"
				}, false);
			}
		}
	});
});