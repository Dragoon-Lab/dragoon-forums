define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/on",
	"dojo/dom-form",
	"dojo/dom-style",
    "dijit/_WidgetBase",
    "dijit/registry",
    "dijit/form/Form",
    "dijit/form/Select",
    "dijit/form/ValidationTextBox",
    "dijit/form/Button",
    "dijit/form/RadioButton",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/authored-problems.html",
    "dojo/text!./templates/authored-problems-ee.html"
], function(declare, lang, array, on, domForm, domStyle, _WidgetBase, registry, form, select, radioButton, textBox, button, _TemplatedMixin, _WidgetsInTemplateMixin, template, template2){

	return declare("AuthoredProblems",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		_availableProblems: null,
		_problemIndex:[],
		_fid : 2,
		_fenable: false,
		_username:"",
		_boardUrl:"",

		constructor:function(/*String*/ problemsUrl, /*String*/ deleteUrl, /*String*/ section, /*String*/ username, /*String*/ boardUrl, /*Number*/fid, /*Boolean*/ fenable){
			this.problemUrl = problemsUrl;
			this.deleteUrl = deleteUrl;
			this._fid = fid;
			this._fenable = fenable;
			this._section = section;
			this._username = username;
			if(username == "joinerr" || username == "kvl" || username =="malexan9" || username == "jwauthor"){
				this.templateString = template2;
			}
			this._boardUrl = boardUrl;
		},

		postCreate: function(){

			this.getAvailableProblems("private");

			//on click listener for submit
			on(registry.byId("authored_problems_submit"), "click", lang.hitch(this, function(){
				this.onSubmit();
			}));
			//on click listener for Name Radio
			on(registry.byId("radio_problem_name"), "click", lang.hitch(this, function(){
				this.onChangeRadio("name");
			}));
			//on click listener for New Name Radio
			on(registry.byId("radio_problem_newname"), "click", lang.hitch(this, function(){
				this.onChangeRadio("new_name");
			}));
			//on change listener for folder change
			on(registry.byId("author_folders"), "change", lang.hitch(this, function(){
				this.onChangeFolder();
			}));

			//on change listener for mode change
			on(registry.byId("author_problem_mode"), "change", lang.hitch(this, function(){
				this.onChangeMode();
			}));
			if(!this.deleteUrl){
				domStyle.set(registry.byId("authored_problems_delete").domNode, "display", "none");
			}else{
				//on click listener for delete problem
				on(registry.byId("authored_problems_delete"), "click", lang.hitch(this, function(){
					this.onDelete();

				}));
			}
		},

		onChangeRadio: function(value){
			if(value=="name"){
				registry.byId("author_problem_name").set("required", true);
				registry.byId("author_problem_name").set("disabled", false);
				registry.byId("author_problem_new_name").set("required", false);
				registry.byId("author_problem_new_name").set("disabled", true);

				registry.byId("author_problem_mode").set("readOnly", false);
				registry.byId("authored_problems_delete").set("disabled", false);
			}else{
				registry.byId("author_problem_name").set("required", false);
				registry.byId("author_problem_name").set("disabled", true);
				registry.byId("author_problem_new_name").set("required", true);
				registry.byId("author_problem_new_name").set("disabled", false);

				registry.byId("author_problem_mode").set("readOnly", true);
				registry.byId("author_problem_mode").set("value", "AUTHOR");
				registry.byId("authored_problems_delete").set("disabled", true);
			}
		},

		onChangeFolder: function() {
			var selectedFolder = registry.byId("author_folders").value;
			this.getAvailableProblems(selectedFolder);
		},

		onChangeMode: function() {
			var selectedMode = registry.byId("author_problem_mode").value;
			if (selectedMode === "AUTHOR"){
				registry.byId("author_problem_activity").set("value", "construction");
				registry.byId("author_problem_activity").set("disabled", true);
			}else{
				registry.byId("author_problem_activity").set("disabled", false);
			}
		},

		getAvailableProblems: function(type){
			//Get available problems from given problems URL
			var data = {}
			if(type == "private"){
				data = {
					g:  this._username,
					s : this._section
				};
			}
			else if(type == "public"){
				data = {
					g:  "public",
					s : this._section
				};
			}
			else{
				data = {
					g: type,
					s: this._section
				};
			}

			dojo.xhrGet({
				url: this.problemUrl,
				handleAs: "json",
				content:data,
				load: lang.hitch(this, function(response){
					this._availableProblems = response;
					this._problemIndex = [{value:"", label:" --- SELECT ---"}];
					array.forEach(response, lang.hitch(this, function(data){
						this._problemIndex.push({"label": data.problem , "value": data.problem});
					}));

					//Set Options
					var problemSelect = registry.byId("author_problem_name");
					registry.byId("author_problem_name").reset();
					registry.byId("author_problem_name").set("value", "");
					problemSelect.set("options", this._problemIndex);
					problemSelect.startup();

				}),
				error: function(error){
					console.log("Error: ", error);
				}
			});
		},

		onSubmit: function(){
			//Validate and Submit the form
			registry.byId("authored_problems").validate();

			if(registry.byId("authored_problems").validate()){
				var formJson = domForm.toObject("authored_problems");
				console.log("Submit Form", formJson);

				var page_url = document.location.href;
      			var query_sid = page_url.substring(page_url.indexOf("sid=") + 4, page_url.length);

				var problem = (formJson.problem_name == "name")? formJson.author_problem_name: formJson.problem_new_name;
				var forumURL = this._boardUrl + "adm/create_forum.php";
				var group = registry.byId("author_folders").value == "private" ? this._username : formJson.group;
				var activity = (formJson.mode === "AUTHOR") ? "construction" : formJson.activity;

				url="https://dragoon.asu.edu/demo/index.html?u="+ this._username +"&g="+group+"&m="+ formJson.mode + "&sm=feedback&is=algebraic&p="+ 
				problem+"&s="+this._section+"&f="+forumURL+"&sid="+query_sid+"&fid="+this._fid +"&fe="+this._fenable+"&a="+activity;

				var win = window.open(url, '_blank');
       			win.focus();
			}
		},

		onDelete: function(){
			//Get group and problem
			var group = registry.byId("author_folders").value == "private" ? this._username : registry.byId("author_folders").value;
			var problem = registry.byId("author_problem_name").value;
			var data = {
				u: this._username,
				p: problem,
				s: this._section,
				g: group
			}
			//Ask for confirmation before deleting
			var shouldDelete = confirm("Are you sure you want to delete "+ problem +" ?");

			if(shouldDelete && problem && group){
				//Call Delete URL with data
				dojo.xhrGet({
					url: this.deleteUrl,
					handleAs: 'text',
					content: data,
					load: lang.hitch(this,function(result){
						alert("Problem deleted sucessfully!");
						this.onChangeFolder();
					}),
					error: function(err){
						alert("Error occured while deleting the problem");
						console.log("Error: ", error);
					}
				});
			}
		}
	})
});
