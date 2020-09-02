/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler"],function(N){"use strict";return sap.ui.controller("i2d.qm.inspsubset.resultsrecords1.ext.controller.ListReportExt",{onInit:function(){this.oSmartTable=this.getView().byId("listReport");this.oSmartTable.setIgnoredFields("WorkCenter,InspectionOperation");this.getOwnerComponent().getRouter().getRoute("root").attachMatched(this.onRouteMatch.bind(this),this);this.getOwnerComponent().getRouter().getRoute("rootquery").attachMatched(this.onRouteMatch.bind(this),this);},onRouteMatch:function(e){this.oSmartTable.rebindTable();}});});
