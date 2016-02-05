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
    "dojo/text!./templates/custom-models.html"
], function(declare, lang, array, on, domForm, domStyle, _WidgetBase, registry, form, select, radioButton, textBox, button, _TemplatedMixin, _WidgetsInTemplateMixin, template){

	return declare("CustomModels",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,
		_availablemodels: null,
		_modelIndex:[],
		_fid : 2,
		_fenable: false,
		_username:"",
		_boardUrl:"",
		
		constructor:function(/*String*/ groupsFile, /*String*/ modelsUrl, /*String*/ deleteUrl, /*String*/ section, /*String*/ username, /*String*/ boardUrl, /*Number*/fid, /*Boolean*/ fenable){
			this.groupsFile = groupsFile;
			this.groups = null;
			this.modelUrl = modelsUrl;
			this.deleteUrl = deleteUrl;
			this._group = null;
			this._fid = fid;
			this._fenable = fenable;
			this._section = section;
			this._username = username;
			this._selectedMode = null;
			this._loadProblemUrl = "https://dragoon.asu.edu/demo";
			/*if(username == "joinerr" || username == "kvl" || username =="malexan9" || username == "jwauthor"){
				this.templateString = template2;
			}*/
			this._boardUrl = boardUrl;
			//console.log("username",this._username);
		},

		postCreate: function(){

			this.getAvailableGroups();

			//on click listener for submit
			on(registry.byId("authored_models_submit"), "click", lang.hitch(this, function(){
				this.onSubmit();
			}));
			//on click listener for Name Radio
			on(registry.byId("radio_model_name"), "click", lang.hitch(this, function(){
				this.onChangeRadio("name");
			}));
			//on click listener for New Name Radio
			on(registry.byId("radio_model_newname"), "click", lang.hitch(this, function(){
				this.onChangeRadio("new_name");
			}));
			//on change listener for folder change
			on(registry.byId("group_folders"), "change", lang.hitch(this, function(){
				this.onChangeFolder();
			}));
			registry.byId("authored_models_delete").set("disabled", true);
			/*//on change listener for mode change
			on(registry.byId("author_model_mode"), "change", lang.hitch(this, function(){
				this.onChangeMode();
			}));*/
			if(!this.deleteUrl){
				domStyle.set(registry.byId("authored_models_delete").domNode, "display", "none");
			}else{
				//on click listener for delete model
				on(registry.byId("authored_models_delete"), "click", lang.hitch(this, function(){
					this.onDelete();

				}));
			}
		},
		getAvailableGroups : function(){
			dojo.xhrGet({
				url: this.groupsFile,
				handleAs: "json",
				load: lang.hitch(this, function(groups){
					if(!groups || groups == "") return;
					this.groups = groups;
					var select_groups = registry.byId("group_folders");
					var options = [{ value: "", label: "-- SELECT --", selected: false }];
					for(var g in groups){
						options.push({ value: g, label: groups[g].name, selected: false });
					} 
					select_groups.addOption(options);
				}),
				error:function(error){
					console.log(error);
				}
			});
			
		},
		onChangeRadio: function(value){
			if(value=="name"){
				registry.byId("author_model_name").set("required", true);
				registry.byId("author_model_name").set("disabled", false);
				registry.byId("author_model_new_name").set("required", false);
				registry.byId("author_model_new_name").set("disabled", true);			
				if(this._selectedMode == "STUDENT") 
					registry.byId("authored_models_delete").set("disabled", true);
				else 
					registry.byId("authored_models_delete").set("disabled", false);
			}else{
				registry.byId("author_model_name").set("required", false);
				registry.byId("author_model_name").set("disabled", true);
				registry.byId("author_model_new_name").set("required", true);
				registry.byId("author_model_new_name").set("disabled", false);
				registry.byId("authored_models_delete").set("disabled", true);
			}
		},

		onChangeFolder: function() {
			var selectedGroup = registry.byId("group_folders").value;
			if(selectedGroup == "") return;
			this._group = selectedGroup;
			this._selectedMode = (this.groups[selectedGroup] &&  this.groups[selectedGroup]["users"].indexOf(this._username) != -1)? "AUTHOR" : "STUDENT";
			this.getAvailableModels(selectedGroup);
			this.onChangeRadio("name")
		},

		onChangeMode: function() {
			var selectedMode = registry.byId("author_model_mode").value;
			if (selectedMode === "AUTHOR"){
				registry.byId("author_model_activity").set("value", "construction");
				registry.byId("author_model_activity").set("disabled", true);
			}else{
				registry.byId("author_model_activity").set("disabled", false);
			}
		},

		getAvailableModels: function(type){
			//Get available models from given models URL
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
				url: this.modelUrl,
				handleAs: "json",
				content:data,
				load: lang.hitch(this, function(response){
					this._availablemodels = response;
					this._modelIndex = [{value:"", label:" -- SELECT --"}];
					array.forEach(response, lang.hitch(this, function(data){
						this._modelIndex.push({"label": data.problem , "value": data.problem});
					}));

					//Set Options
					var modelSelect = registry.byId("author_model_name");
					registry.byId("author_model_name").reset();
					registry.byId("author_model_name").set("value", "");
					modelSelect.set("options", this._modelIndex);
					modelSelect.startup();

				}),
				error: function(error){
					console.log("Error: ", error);
				}
			});
		},

		onSubmit: function(){
			//Validate and Submit the form
			registry.byId("authored_models").validate();

			if(registry.byId("authored_models").validate()){
				//check if the selectedMode is null;
				var formJson = domForm.toObject("authored_models");
				console.log("Submit Form", formJson);
				var mode = this._selectedMode ? this._selectedMode : "STUDENT";  
				var page_url = document.location.href;
      			var query_sid = page_url.substring(page_url.indexOf("sid=") + 4, page_url.length);

				var model = (formJson.model_type == "name")? formJson.author_model_name: formJson.model_new_name;
				var forumURL = this._boardUrl + "adm/create_forum.php";
				var group = formJson.group;
				var activity =  "construction" ;

				url= this._loadProblemUrl + "/index.html?u="+ this._username +"&g="+group+"&m="+ mode + "&sm=feedback&is=algebraic&p="+ 
				model+"&s="+this._section+"&f="+forumURL+"&sid="+query_sid+"&fid="+this._fid +"&fe="+this._fenable+"&a="+activity;

				var win = window.open(url, '_blank');
       			win.focus();
			}
		},

		onDelete: function(){
			//Get group and model
			var group = registry.byId("group_folders").value;
			var model = registry.byId("author_model_name").value;
			var data = {
				u: this._username,
				p: model,
				s: this._section,
				g: group
			}
			//Ask for confirmation before deleting
			var shouldDelete = confirm("Are you sure you want to delete "+ model +" ?");
			if(shouldDelete && model && group){
				//Call Delete URL with data
				dojo.xhrGet({
					url: this.deleteUrl,
					handleAs: 'text',
					content: data,
					load: lang.hitch(this,function(result){
						alert("model deleted sucessfully!");
						this.onChangeFolder();
					}),
					error: function(err){
						alert("Error occured while deleting the model");
						console.log("Error: ", error);
					}
				});
			}
		}
	})
});
