/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/util/MockServer"],function(M){"use strict";var m,_="i2d.qm.inspsubset.resultsrecords1/",a=_+"localService/mockdata";return{init:function(){var u=jQuery.sap.getUriParameters(),j=jQuery.sap.getModulePath(a),s=jQuery.sap.getModulePath(_+"manifest",".json"),e="C_InspLotRsltRec",E=u.get("errorType"),i=E==="badRequest"?400:500,o=jQuery.sap.syncGetJSON(s).data,d=o["sap.app"].dataSources,b=d.mainService,c=jQuery.sap.getModulePath(_+b.settings.localUri.replace(".xml",""),".xml"),f=/.*\/$/.test(b.uri)?b.uri:b.uri+"/",A=b.settings.annotations;m=new M({rootUri:f});M.config({autoRespond:true,autoRespondAfter:(u.get("serverDelay")||1000)});m.simulate(c,{sMockdataBaseUrl:j,bGenerateMissingMockData:true});var r=m.getRequests(),R=function(g,h,k){k.response=function(x){x.respond(g,{"Content-Type":"text/plain;charset=utf-8"},h);};};r.push({method:"POST",path:new RegExp("C_InspSubsetRsltRecActivation\\?InspectionLot=(.*)&InspPlanOperationInternalID=(.*)&InspectionSubsetInternalID=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)"),response:function(x,I,g,h,D,k){var l=jQuery.sap.sjax({type:"GET",url:f+"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"});x.respondJSON(200,{},JSON.stringify(l.data));return true;}});r.push({method:"POST",path:new RegExp("C_InspSubsetRsltRecEdit\?PreserveChanges=true&InspectionLot=(.*)&InspectionSubsetInternalID=(.*)&InspPlanOperationInternalID=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)"),response:function(x,I,g,h,D,k){var l=jQuery.sap.sjax({type:"GET",url:f+"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"});x.respondJSON(200,{},JSON.stringify(l.data));return true;}});r.push({method:"DELETE",path:new RegExp("C_InspSubsetRsltRecActivation\\?InspectionLot=(.*)&InspPlanOperationInternalID=(.*)&InspectionSubsetInternalID=(.*)&DraftUUID=(.*)&IsActiveEntity=(.*)"),response:function(x,I,g,h,D,k){var l=jQuery.sap.sjax({type:"GET",url:f+"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"});x.respondJSON(200,{},JSON.stringify(l.data));return true;}});r.push({method:"DELETE",path:new RegExp("C_InspSubsetRsltRec\(.*\).*"),response:function(x,I,g,h,D,k){var l=jQuery.sap.sjax({type:"GET",url:f+"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"});x.respondJSON(200,{},JSON.stringify(l.data));return true;}});r.push({method:"POST",path:new RegExp("C_InspSubsetRsltRec\?[$]filter=PreserveChanges eq true and InspectionLot eq (.*) and InspectionSubsetInternalID eq (.*) and InspPlanOperationInternalID eq (.*) and DraftUUID eq guid(.*) and IsActiveEntity eq (.*)"),response:function(x,I,g,h,D,k){var l=jQuery.sap.sjax({type:"GET",url:f+"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"});x.respondJSON(200,{},JSON.stringify(l.data));return true;}});r.push({method:"GET",path:new RegExp("C_InspSubsetRsltRec\?[$]filter=PreserveChanges eq true and InspectionLot eq (.*) and InspectionSubsetInternalID eq (.*) and InspPlanOperationInternalID eq (.*) and DraftUUID eq guid(.*) and IsActiveEntity eq (.*)"),response:function(x,I,g,h,D,k){var l=jQuery.sap.sjax({type:"GET",url:f+"C_InspSubsetRsltRec?$filter=InspectionLot eq '030000005402' & InspectionOperation eq '0020' & (IsActiveEntity eq 'true' || IsActiveEntity eq 'false')"});x.respondJSON(200,{},JSON.stringify(l.data));return true;}});m.setRequests(r);if(u.get("metadataError")){r.forEach(function(g){if(g.path.toString().indexOf("$metadata")>-1){R(500,"metadata Error",g);}});}if(E){r.forEach(function(g){if(g.path.toString().indexOf(e)>-1){R(i,E,g);}});}m.start();jQuery.sap.log.info("Running the app with mock data");A.forEach(function(g){var h=d[g],U=h.uri,l=jQuery.sap.getModulePath(_+h.settings.localUri.replace(".xml",""),".xml");new M({rootUri:U,requests:[{method:"GET",path:new RegExp("([?#].*)?"),response:function(x){jQuery.sap.require("jquery.sap.xml");var k=jQuery.sap.sjax({url:l,dataType:"xml"}).data;x.respondXML(200,{},jQuery.sap.serializeXML(k));return true;}}]}).start();});},getMockServer:function(){return m;}};});
