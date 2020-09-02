/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	var oMockServer,
		_sAppModulePath = "i2d.qm.inspsubset.resultsrecords1/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	return {

		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */

		init: function () {
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				sEntity = "C_InspLotRsltRec",
				sErrorParam = oUriParameters.get("errorType"),
				iErrorCode = sErrorParam === "badRequest" ? 400 : 500,
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oDataSource = oManifest["sap.app"].dataSources,
				oMainDataSource = oDataSource.mainService,
				sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/",
				aAnnotations = oMainDataSource.settings.annotations;

			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 1000)
			});

			// load local mock data
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true
			});

			var aRequests = oMockServer.getRequests(),
				fnResponse = function (iErrCode, sMessage, aRequest) {
					aRequest.response = function (oXhr) {
						oXhr.respond(iErrCode, {
							"Content-Type": "text/plain;charset=utf-8"
						}, sMessage);
					};
				};

			aRequests.push(

				{
					method: "POST",
					path: new RegExp(
						"C_InspSubsetRsltRecActivation\\?InspectionLot=(.*)&InspPlanOperationInternalID=(.*)&InspectionSubsetInternalID=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)"
					),
					response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
						var oResponse = jQuery.sap.sjax({
							type: "GET",
							// url: sMockServerUrl +
							// 	"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
							url: sMockServerUrl +
								"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
						});

						oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));

						return true;

					}
				}
			);
			
			// aRequests.push(
			// 	{
			// 		method: "POST",
			// 		// C_MfgStandardTextTPEdit\\?MfgStandardText=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)
			// 		// path: "C_InspSubsetRsltRecEdit?PreserveChanges=true&InspectionLot='030000005402'&InspectionSubsetInternalID='000001'&InspPlanOperationInternalID='00000002'&DraftUUID=guid'00000000-0000-0000-0000-000000000000'&IsActiveEntity=true",
			// 		path: new RegExp("C_InspSubsetRsltRecPreparation\\?InspectionLot=(.*)&InspPlanOperationInternalID=(.*)&InspectionSubsetInternalID=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)"),
			// 		// path: new RegExp("^C_InspSubsetRsltRecEdit\??"),
			// 		response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
			// 			debugger;
			// 			var oResponse = jQuery.sap.sjax({
			// 				type: "GET",
			// 				url: sMockServerUrl +
			// 					"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
			// 			});
			// 			oXhr.respondJSON(200, {}, true);
			// 			return true;
			// 		}
			// 	}
			// );
				aRequests.push(
				{
					method: "POST",
					// C_MfgStandardTextTPEdit\\?MfgStandardText=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)
					// path: "C_InspSubsetRsltRecEdit?PreserveChanges=true&InspectionLot='030000005402'&InspectionSubsetInternalID='000001'&InspPlanOperationInternalID='00000002'&DraftUUID=guid'00000000-0000-0000-0000-000000000000'&IsActiveEntity=true",
					path: new RegExp("C_InspSubsetRsltRecEdit\?PreserveChanges=true&InspectionLot=(.*)&InspectionSubsetInternalID=(.*)&InspPlanOperationInternalID=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)"),
					// path: new RegExp("^C_InspSubsetRsltRecEdit\??"),
					response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
						var oResponse = jQuery.sap.sjax({
							type: "GET",
							url: sMockServerUrl +
								"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
						});
						oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
						return true;
					}
				}
			);
			aRequests.push(
				{
					method: "DELETE",
					path: new RegExp(
						"C_InspSubsetRsltRecActivation\\?InspectionLot=(.*)&InspPlanOperationInternalID=(.*)&InspectionSubsetInternalID=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)"
					),
					response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
						var oResponse = jQuery.sap.sjax({
							type: "GET",
							url: sMockServerUrl +
								"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
						});

						oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));

						return true;

					}
				}
			);
			aRequests.push(
				{
					method: "DELETE",
					path: new RegExp("C_InspSubsetRsltRec\(.*\).*"),
					response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
						var oResponse = jQuery.sap.sjax({
							type: "GET",
							url: sMockServerUrl +
								"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
						});
						oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
						return true;
					}
				}
			);
			aRequests.push(
				{
					method: "POST",
					path: new RegExp("C_InspSubsetRsltRec\?[$]filter=PreserveChanges eq true and InspectionLot eq (.*) and InspectionSubsetInternalID eq (.*) and InspPlanOperationInternalID eq (.*) and DraftUUID eq guid(.*) and IsActiveEntity eq (.*)"),
					response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
						var oResponse = jQuery.sap.sjax({
							type: "GET",
							url: sMockServerUrl +
								"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
						});
						oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
						return true;
					}
				}
			);
				aRequests.push(
				{
					method: "GET",
					path: new RegExp("C_InspSubsetRsltRec\?[$]filter=PreserveChanges eq true and InspectionLot eq (.*) and InspectionSubsetInternalID eq (.*) and InspPlanOperationInternalID eq (.*) and DraftUUID eq guid(.*) and IsActiveEntity eq (.*)"),
					response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
						var oResponse = jQuery.sap.sjax({
							type: "GET",
							url: sMockServerUrl +
								 "C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
						});
						oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
						return true;
					}
				}
			);
			// aRequests.push(
			// 	{
			// 		method: "POST",
			// 		path: new RegExp("C_InspSubsetRsltRecEdit\(.*\).*"),
			// 		response: function (oXhr, InspectionLot, InspPlanOperationInternalID, InspectionSubsetInternalID, DraftUUID, IsActiveEntity) {
			// 			var oResponse = jQuery.sap.sjax({
			// 				type: "GET",
			// 				url: sMockServerUrl +
			// 					"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"
			// 			});
			// 			oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));

			// 			return true;

			// 		}
			// 	}
			// );
			
		
			oMockServer.setRequests(aRequests);
			// handling the metadata error test
			if (oUriParameters.get("metadataError")) {
				aRequests.forEach(function (aEntry) {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}

			// Handling request errors
			if (sErrorParam) {
				aRequests.forEach(function (aEntry) {
					if (aEntry.path.toString().indexOf(sEntity) > -1) {
						fnResponse(iErrorCode, sErrorParam, aEntry);
					}
				});
			}
			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");

			// if (aAnnotations) {
			aAnnotations.forEach(function (sAnnotationName) {
				var oAnnotation = oDataSource[sAnnotationName],
					sUri = oAnnotation.uri,
					sLocalUri = jQuery.sap.getModulePath(_sAppModulePath + oAnnotation.settings.localUri.replace(".xml", ""), ".xml");

				///annotiaons
				new MockServer({
					rootUri: sUri,
					requests: [{
						method: "GET",
						path: new RegExp("([?#].*)?"),
						response: function (oXhr) {
							jQuery.sap.require("jquery.sap.xml");

							var oAnnotations = jQuery.sap.sjax({
								url: sLocalUri,
								dataType: "xml"
							}).data;

							oXhr.respondXML(200, {}, jQuery.sap.serializeXML(oAnnotations));
							return true;
						}
					}]

				}).start();

			});
			//		}

		},

		/**
		 * @public returns the mockserver of the app, should be used in integration tests
		 * @returns {sap.ui.core.util.MockServer}
		 */
		getMockServer: function () {
			return oMockServer;
		}
	};

});