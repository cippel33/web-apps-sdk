describe("Check webapp assign customfields.", function() {
    var webappName = "WebAppCustomfieldsApp",
        appCreated = undefined;

    var MAX_TIMEOUT = BCAPI.Config.MAX_TIMEOUT;

    function createApp() {
        var webapp = new BCAPI.Models.WebApp.App({"name": webappName});

        appCreated = undefined;
        webapp.destroy().always(function() {
            webapp = new BCAPI.Models.WebApp.App({"name": webappName});
            webapp.save().then(function() {
                return webapp.fetch();
            }).then(function() {
                appCreated = webapp;
            });
        });

    }

    beforeEach(function() {
        BCAPI.Helper.Test.runTestServer();

        runs(createApp);

        waitsFor(function() {
            return appCreated;
        }, "Webapp " + webappName + " not created correctly.", MAX_TIMEOUT);
    });

    it("Check webapp customfields update.", function() {    	
        _checkEmptyCustomFields();
        
        _createCustomFields();             
    });

    function _checkEmptyCustomFields() {
        var webappCustomfieldsCollection = new BCAPI.Models.WebApp.CustomFieldCollection(webappName),
            customfieldsRetrievedEmpty = false;

        runs(function() {
            webappCustomfieldsCollection.fetch({
                success: function() {
                    customfieldsRetrievedEmpty = true;
                }
            });
        });

        waitsFor(function() {
            return customfieldsRetrievedEmpty;
        }, "Webapp " + webappName + " customfields not fetched correctly.", MAX_TIMEOUT);

        runs(function() {
            expect(webappCustomfieldsCollection.length).toBe(0);
        });

    };

    function _createCustomFields() {
    	var customFieldsCreated = undefined;
    	
        var customField1 = new BCAPI.Models.WebApp.CustomField(webappName, {
            "id"      : 1,
            "name"    : "Part code1",
            "type"    : "DropDown_List",
            "listItems": ["First option", "Second one"],
            "required": true
        });

        var customField2 = new BCAPI.Models.WebApp.CustomField(webappName, {
            "id"      : 2,
            "name"    : "Part code2",
            "type"    : "DropDown_List",
            "listItems": ["First option", "Second one"],
            "required": true
        });
        
        var customField3 = new BCAPI.Models.WebApp.CustomField(webappName, {
            "id"      : 3,
            "name": "Datasource Custom Field",
        	"type": "DataSource",
        	"required": false,
        	"dataSource": "Car Catalogue"
        });

        var items = [customField1, customField2, customField3],
        	markDone = _.after(items.length, function() {
        		customFieldsCreated = items;
        	});
        
        runs(function() {
        	_.each(items, function(field) {
        		field.save({success: markDone});
        	});
        });    
        
        waitsFor(function() {
        	return customFieldsCreated;
        }, "Custom fields for webapp " + webappName + " not created.", MAX_TIMEOUT);        

        runs(function() {
        	_checkCustomFields(customFieldsCreated);
        });
    };

    function _checkCustomFields(expectedCustomFields) {
        var webappCustomfieldsCollection = new BCAPI.Models.WebApp.CustomFieldCollection(webappName),
            customfieldsFetched = undefined,
            customFieldsIndexed = {};
        
        _.each(expectedCustomFields, function(field) {
        	customFieldsIndexed[field.get("name")] = field;
        });
        
        runs(function() {
            webappCustomfieldsCollection.fetch({
                success: function(customfields) {
                    customfieldsFetched = customfields;
                }
            });
        });

        waitsFor(function() {
            return customfieldsFetched;
        }, "Webapp " + webappName + " customfields not parsed correctly.", MAX_TIMEOUT);

        runs(function() {
            expect(customfieldsFetched.length).toBe(expectedCustomFields.length);
            
            customfieldsFetched.each(function(item) {
            	var field = customFieldsIndexed[item.get("name")],
            		expectedDataSource = field.get("dataSource") == undefined ? null : field.get("dataSource");
            	
                expect(item.get("name")).toBe(field.get("name"));
                expect(item.get("type")).toBe(field.get("type"));
                expect(item.get("required")).toBe(field.get("required"));
                
                expect(item.get("dataSource")).toBe(expectedDataSource);
            });
        });
    };
});