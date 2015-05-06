define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom-form",
    "dijit/_WidgetBase",
    "dijit/registry",
    "dijit/form/Form",
    "dijit/form/Select",
    "dijit/form/TextBox",
    "dijit/form/Button",
    "dijit/form/RadioButton",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/official-problems.html"
], function(declare, lang, on, domForm, _WidgetBase, registry, form, select, radioButton, textBox, button, _TemplatedMixin, _WidgetsInTemplateMixin, template){

	return declare("OfficialProblems",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		
		templateString: template,
		_folderIndex: [],
		_problemIndex: null,
		_fid: 2,
		_fenable: false,
		_section: "testing",

		constructor: function(/*String*/ problemsURL, /*String*/ section, /*Number*/ fid, /*Boolean*/ fenable){
			this._problemsFile = problemsURL;	
			this._fid = fid;
			this._fenable = fenable;
			this._section = section;
		},

		postCreate: function(){
			//Load Problems given URL
			this.loadProblemIndex();

			//on change listener for select folders
			on(registry.byId("official_folders"), "change", lang.hitch(this, function(){
				this.onChangeFolder();
			}));

			//on click listener for submit
			on(registry.byId("submit_official_problem"), "click", lang.hitch(this, function(){
				this.onSubmit();
			}));
		},

		onChangeFolder: function(){		
			//Load Problems
			var selectedCategory = registry.byId("official_folders").value;
			var problemSelect = registry.byId("official_problem_name");
			var problems = []
			for(problem in this._problemIndex[selectedCategory]){
				problems.push({"label":problem , "value": this._problemIndex[selectedCategory][problem]});
			}
			problemSelect.set("options", problems);
			problemSelect.startup();
		},

		loadProblemIndex: function(){
			dojo.xhrGet({
				url: this._problemsFile,
				handleAs: "json",
				load: lang.hitch(this, function(response){
					this._problemIndex = response;

					//Load Folders
					var categoryKeys = this._getKeys(response);
					for(key in categoryKeys){
						this._folderIndex.push({"label": categoryKeys[key], "value": categoryKeys[key]});
					}

					//Set Folders Options
					var folderSelect = registry.byId("official_folders");
					folderSelect.set("options", this._folderIndex);
					folderSelect.startup();

					//Set problem options
					this.onChangeFolder();
				}),
				error:function(error){
					console.log(error);
				}
			});
		},

		onSubmit: function(){
			//Validate and submit the form
			if(registry.byId("official_problems").validate()){
				var formJson = domForm.toObject("official_problems");
				console.log(formJson);

				var page_url = document.location.href;
      			var query_sid = page_url.substring(page_url.indexOf("sid=") + 4, page_url.length);
      			
				url="http://dragoon.asu.edu/demo/index.html?u="+ formJson.username +"&m="+ formJson.mode + "&sm=feedback&is=algebraic&p="+ 
				formJson.problem+"&s="+this._section+"&f="+formJson.forumurl+"&sid="+query_sid+"&fid="+this._fid +"&fe="+this._fenable;
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
	
});