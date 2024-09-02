sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/Button",
    "sap/m/library"
],
function (Controller,Device,JSONModel,Popover,Button,library) {
    "use strict";
 
    return Controller.extend("com.app.rfscreens.controller.Usermenu", {
        onInit: function () {
          
            this._setToggleButtonTooltip(!Device.system.desktop);
            const oRouter = this.getOwnerComponent().getRouter();
               
            
                   // Initialize JSON Model
                   var oModel = new JSONModel();
                   this.getView().setModel(oModel);
   
                   // Load data asynchronously
                   oModel.loadData(sap.ui.require.toUrl("com/app/rfscreens/model/data.json"));
                   oModel.attachRequestCompleted(function (oEvent) {
                       if (!oEvent.getParameter("success")) {
                           MessageToast.show("Failed to load data.");
                       }
                   }.bind(this));

                   oRouter.attachRoutePatternMatched(this.onResourceDetailsLoad, this);
        },


        onResourceDetailsLoad: async function (oEvent1) {
            debugger;
        
            const { id } = oEvent1.getParameter("arguments");
            this.ID = id;
            console.log(this.ID);
        
            var oModel = this.getView().getModel();
            var oModel1 = this.getOwnerComponent().getModel();
        
            await oModel1.read("/RFUISet('" + this.ID + "')", {
                success: function (oData) {
                    var area = oData.Area;
                    var areaArray = area.split(", ");
                    var group = oData.Resourcegroup;
                    var groupArray = group.split(", ");
                    var resourceType = oData.Queue;
        
                    var aNavigationData = oModel.getProperty("/navigation");
        
                    // Define which process and item to show
                    debugger;
        
                    var sProcessToShow = areaArray;
                    var sItemToShow = groupArray;
        
                    // Create the ProcessToShow array with the required format
                    var formattedProcesses = sProcessToShow.map(function (process) {
                        return `${process} Process`;
                    });
        
                    // Loop through navigation data
                    aNavigationData.forEach(function (oProcess) {
                        // Flag to determine if this process should be skipped
                        var processCompleted = false;
        
                        // Loop through items of each process
                        oProcess.items.forEach(function (oItem) {
                            if (processCompleted) {
                                return; // Skip processing if process is already completed
                            }
        
                            // Check if the current process title matches any formatted process
                            formattedProcesses.forEach(function (formattedProcess) {
                                if (oProcess.visible) {
                                    processCompleted = true; // Skip if already visible
                                    return;
                                }
        
                                // Check if the process and item match
                                if (oProcess.title === formattedProcess) {
                                    sItemToShow.forEach(function (group) {
                                        if (oItem.title === group) {
                                            oProcess.visible = true;
                                            oItem.visible = true;  // Set to true for matching item
                                            processCompleted = true; // Mark this process as completed
                                        } else {
                                            oItem.visible = false; // Ensure all others are set to false
                                        }
                                    });
                                } else {
                                    oProcess.visible = false;
                                }
                            });
                        });
        
                        // Skip further processing for this process if it's completed
                        if (processCompleted) {
                            return;
                        }
                    });
        
                    // Update the model with modified visibility data
                    oModel.setProperty("/navigation", aNavigationData);
        
                    // Further actions can be performed here, like navigating to the next view
                }.bind(this),
                error: function () {
                    MessageToast.show("User does not exist");
                }
            });
        
            // Additional code can be placed here if needed
        },
 
        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();
 
            this._setToggleButtonTooltip(bSideExpanded);
 
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },
 
        _setToggleButtonTooltip: function (bLarge) {
            var oToggleButton = this.byId('sideNavigationToggleButton');
            if (bLarge) {
                oToggleButton.setTooltip('Large Size Navigation');
            } else {
                oToggleButton.setTooltip('Small Size Navigation');
            }
        }
    });
});
 