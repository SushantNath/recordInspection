/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control", "sap/suite/ui/microchart/StackedBarMicroChart"],
	function(Control, StackedBarMicroChart) {
		return StackedBarMicroChart.extend("i2d.qm.inspsubset.resultsrecords1.customcontrol.viz.StackedBar", {
			metadata: {
				properties: {
					"currentItems": {
						type: "int",
						defaultValue: []
					}
				}
			},
			renderer: {},
			onBeforeRendering: function(oEvent) {
				var iSum = 0;
				var iCount = 0;
				var sTooltip = "";
				var aBars = this.getBars();
				if (this.getId().search("progressOfCharac") !== -1) {
					if (this.getBindingContext().getObject().InspSubsetCharcAcceptedCount === 0 && this.getBindingContext().getObject().InspSubsetCharcRejectedCount ===
						0 && this.getBindingContext().getObject().InspSubsetCharcOpenCount === 0) {
						aBars[0].setValueColor("Neutral");
					} else {
						aBars[0].setValueColor("Good");
						aBars[0].setValue(this.getBindingContext().getObject().InspSubsetCharcAcceptedCount);
						aBars[1].setValueColor("Error");
						aBars[1].setValue(this.getBindingContext().getObject().InspSubsetCharcRejectedCount);
						aBars[2].setValueColor("Neutral");
						aBars[2].setValue(this.getBindingContext().getObject().InspSubsetCharcOpenCount);
					}
					iSum += this.getBindingContext().getObject().InspSubsetCharcRejectedCount + this.getBindingContext().getObject().InspSubsetCharcAcceptedCount +
						this.getBindingContext().getObject().InspSubsetCharcOpenCount;
					iCount += this.getBindingContext().getObject().InspSubsetCharcRejectedCount + this.getBindingContext().getObject().InspSubsetCharcAcceptedCount;
					this.setMaxValue(iSum);
					var valueForInspPlanedText = this.getParent().getItems()[1];
					valueForInspPlanedText.setText(iCount + " " + "/" + " " + iSum);
					sTooltip = this.getTooltipFunction(this.getBindingContext().getObject().InspSubsetCharcOpenCount, this.getBindingContext().getObject()
						.InspSubsetCharcAcceptedCount, this.getBindingContext().getObject().InspSubsetCharcRejectedCount);
					this.setTooltip(sTooltip);
				} else if (this.getId().search("valuationHistory") !== -1 && oEvent.srcControl.getId().search("valuationHistoryDialog") === -1) {
					if (this.getBindingContext().getObject().InspSubsetAcceptedCount === 0 && this.getBindingContext().getObject().InspSubsetRejectedCount ===
						0) {
						aBars[0].setValueColor("Neutral");
					} else {
						aBars[0].setValueColor("Good");
						aBars[0].setValue(this.getBindingContext().getObject().InspSubsetAcceptedCount);
						aBars[1].setValueColor("Error");
						aBars[1].setValue(this.getBindingContext().getObject().InspSubsetRejectedCount);
						aBars[2].setValueColor("Neutral");
						aBars[2].setValue(0);
					}
					iSum += this.getBindingContext().getObject().InspSubsetRejectedCount + this.getBindingContext().getObject().InspSubsetAcceptedCount;
					this.setMaxValue(iSum);
					sTooltip = this.getTooltipFunction(0, this.getBindingContext().getObject().InspSubsetAcceptedCount, this.getBindingContext().getObject()
						.InspSubsetRejectedCount);
					this.setTooltip(sTooltip);
				} else if (oEvent.srcControl.getId().search("valuationHistoryDialog") !== -1) {
					if (this.getBindingContext().getObject().InspSubsetCharcAcceptedCount === 0 && this.getBindingContext().getObject().InspSubsetCharcRejectedCount ===
						0 && this.getBindingContext().getObject().InspSubsetCharcOpenCount === 0) {
						aBars[0].setValueColor("Neutral");
					} else {
						aBars[0].setValueColor("Good");
						aBars[0].setValue(this.getBindingContext().getObject().InspSubsetCharcAcceptedCount);
						aBars[1].setValueColor("Error");
						aBars[1].setValue(this.getBindingContext().getObject().InspSubsetCharcRejectedCount);
						aBars[2].setValueColor("Neutral");
						aBars[2].setValue(this.getBindingContext().getObject().InspSubsetCharcOpenCount);
					}
					iSum += this.getBindingContext().getObject().InspSubsetCharcRejectedCount + this.getBindingContext().getObject().InspSubsetCharcAcceptedCount +
						this.getBindingContext().getObject().InspSubsetCharcOpenCount;
					this.setMaxValue(iSum);
					sTooltip = this.getTooltipFunction(this.getBindingContext().getObject().InspSubsetCharcOpenCount, this.getBindingContext().getObject()
						.InspSubsetCharcAcceptedCount, this.getBindingContext().getObject().InspSubsetCharcRejectedCount);
					this.setTooltip(sTooltip);
				}

				StackedBarMicroChart.prototype.onBeforeRendering.apply(this, arguments);
			},

			getTooltipFunction: function(openCount, acceptedCount, rejectedCount) {

				if (openCount !== 0) {
					var sTooltip = this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText(
							"OpenCharac") + " " + openCount + "\n" + this.getModel(
							"i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("Accept") + " " + acceptedCount +
						"\n" + this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec")
						.getResourceBundle().getText("Reject") + " " + rejectedCount;
				} else {
					sTooltip = this.getModel(
							"i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec").getResourceBundle().getText("Accept") + " " + acceptedCount +
						"\n" + this.getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_InspLotRsltRec")
						.getResourceBundle().getText("Reject") + " " + rejectedCount;
				}
				return sTooltip;
			}
		});
	});