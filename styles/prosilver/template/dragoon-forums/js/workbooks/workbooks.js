define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/on",
	"dojo/dom-form",
    "dijit/_WidgetBase",
    "dijit/registry",
    "dijit/form/Form",
    "dijit/form/Select",
    "dijit/form/ValidationTextBox",
    "dijit/form/Button",
    "dijit/form/RadioButton",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/workbooks.html"
], function(declare, lang, array, on, domForm, _WidgetBase, registry, form, select, radioButton, textBox, button, _TemplatedMixin, _WidgetsInTemplateMixin, template){

	return declare("Workbooks",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        _workbooks : null,
        _workbooksOptions: [],
        _section: "testing",
        _username: "",

        constructor: function(/*String*/ section, /*String*/ username){
            this._section = section;
            this._username = username;
        },

        postCreate: function(){
             dojo.xhrGet({
                url:"./styles/prosilver/template/dragoon-forums/js/workbooks/workbook-index.json",
                handleAs: "json",
                load: lang.hitch(this, function(response){
                    this._workbooks = response;

                    var categoryKeys = this._getKeys(response);
                    for(key in categoryKeys){
                        this._workbooksOptions.push({"label": categoryKeys[key], "value": response[categoryKeys[key]]});
                    }
                    //Set Options
                    var workbookSelect = registry.byId("workbook_select");
                    workbookSelect.set("options", this._workbooksOptions);
                    workbookSelect.startup();
                }),
                error: function(error){
                    console.log("Could not load Workbooks" +error);
                }
            });

            on(registry.byId("workbook_submit"), "click", lang.hitch(this, function(){
                this.onSubmit();
            }));

        },

        onSubmit: function(){
            //Validate and submit the form
            if(registry.byId("workbook_problems").validate()){
                var formJson = domForm.toObject("workbook_problems");
                console.log(formJson);

                var page_url = document.location.href;
                var query_sid = page_url.substring(page_url.indexOf("sid=") + 4, page_url.length);
                
                 url="http://dragoon.asu.edu/worksheets/"+formJson.workbook_name+"?u="+ this._username +"&s="+this._section;
                var win = window.open(url, '_blank');
                win.focus();
            }
        },

        _getKeys: function(obj){
            //Util function to get keys from JSON object
            var cols = new Array();
            for (var key in obj) {
                cols.push(key);
            }
            return cols;
        }

	});
})
