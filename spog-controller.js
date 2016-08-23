import angular from 'angular';
class controller {

  constructor($http, $state, $q, $rootScope, AppHubService){
  	this.init($http, $state, $q, $rootScope, AppHubService);
  }

  init($http, $state, $q, $rootScope, AppHubService){
  	var self = this;
	
	angular.element(document).ready(function() {
		var counter = 0;
	    var colBrowser = document.querySelector('px-context-browser');
	    if(colBrowser){
			self.initContextBrowser(colBrowser);
		}
	    self.defaultToPreSelectedView();

	    self.navigateToSelectedView();
	}); //eo ready

	self.initContextBrowser = function(browser){
		
	    //initial context call for first column
	    $http.get('contextbrowser/api/allInstances?parent=null')
	        .then(function(response){
	            if(response.data.length>0){
	                for(var ii=0;ii<response.data.length;ii++){
	                    //add identifiers to children
	                    
	                    response.data[ii]['identifier'] = '00-' + ii;
	                    response.data[ii]['hasChildren'] = true;
	                    response.data[ii]['isOpenable'] = true;
	                }
	                browser.browserContext=initialContext(response.data);
	            }
	        });

	    browser.handlers = {
	        getChildren: function(parent, newIndex) {
	        	return demoGetChildren(parent);
	        },
	        itemOpenHandler: function(context) {
	        	var customEvent = {};
	        	customEvent.data = 'something';
	        	$rootScope.$emit(customEvent);
	        }
	    };
	}
	function demoGetChildren(node) {
	    
	    var nodeId = node.identifier,
	        deferred = $q.defer(),
	        children,
	        response,
	        ironAjaxEl = document.createElement('iron-ajax'),
	        nodeIds = {};
	    ironAjaxEl.handleAs = "json";
	    ironAjaxEl.addEventListener('response', function(evt) {
	        if(evt.detail.response) {
	            children  = evt.detail.response;
	            deferred.resolve(children);
	        } else {
	            return;
	        }
	    });

	    var parent;
	    if(!node.uri){
	        parent = 'null';
	    } else {
	        parent = node.uri;
	    }
	    //url to call to apm - parent comes from node. null returns enterprises
	    var url = 'contextbrowser/api/allInstances?parent=' + parent;
	    //call itself
	    $http.get(url)
	        .then(function(response){
	            if(response.data.length>0){
	                for(var ii=0;ii<response.data.length;ii++){
	                    //add context-browser attributes
	                    response.data[ii]['identifier'] = node.identifier + ('a' + ii);
	                    response.data[ii]['hasChildren'] = true;
	                    response.data[ii]['isOpenable'] = true;
	                }
	            }

	            if(nodeId){
	                var pId = nodeId;
	            } else{
	                nodeId = node.name;
	            }
	            deferred.resolve({data:response.data,meta:{parentId:nodeId}});
	        }); //eo http.get.then
	    //don't forget to return the promise!
	    return deferred.promise;
	}

	function initialContext(data){
		var obj = {};
		obj.data=data;
		obj.meta={ "parentId": null };
		return obj;
	};

	self.defaultToPreSelectedView = function (){ 
		var viewMenuItems = document.querySelector('view-menu-items');
		var pxDropDownElement = document.querySelector("#pxDropdown");
						
    	if(viewMenuItems){
    		let currentAppName = viewMenuItems.appName;
    		let currentState = AppHubService.getState();

    		let preSelectedViewExists = false;

	        if(currentState){
	        	if(currentState.selectedViews){
	        		
	        		let appIdx = _.findIndex(currentState.selectedViews, function(o) { return o.appName == currentAppName; });	
	        		//There's a PreSelected View for this App
					if(appIdx > -1){
						preSelectedViewExists = true;
						pxDropDownElement.displayValue = currentState.selectedViews[appIdx].selectedView;
						$state.go(currentState.selectedViews[appIdx].selectedState, {});
					}
				}
	        }

			if(!preSelectedViewExists){
				self.goToDefaultState(viewMenuItems.dropdownItems, pxDropDownElement);
			}
	    }
	};

    self.navigateToSelectedView = function (){
    	
    	let currentState = AppHubService.getState();
    	var viewMenuItems = document.querySelector('view-menu-items');
		
    	if(viewMenuItems){
    		viewMenuItems.addEventListener('viewDropdownItemChanged', function(evt){
		    	if(evt.detail){
		    		if(evt.detail.selectedViewItem){

		    			let appNameOfSelectedViewFoundInState = false;
		    			
		    			if(currentState){
							if(currentState.selectedViews){								
								let appIdx = _.findIndex(currentState.selectedViews, function(o) { return o.appName === evt.detail.selectedViewItem.appName; });
								//The app state is already in SessionState, just update View value
								if(appIdx > -1){
									appNameOfSelectedViewFoundInState = true;
									currentState.selectedViews = self.updateSelectedViewOfAMicroApp(currentState.selectedViews, appIdx, evt.detail);
								}
							}
	                    }

	                    if(!appNameOfSelectedViewFoundInState){
	                    	if(!currentState){ currentState = {}; }
					    	if(!currentState.selectedViews){ currentState.selectedViews = []; }
					    	currentState.selectedViews = self.addNewMicroAppToState(currentState.selectedViews, evt.detail);
	                    }

		    			AppHubService.setState(currentState);
		    			$state.go(evt.detail.selectedViewItem.state, {});
		    		}
		    	}
		    });
    	}
	};

    self.goToDefaultState = function(dropdownItems, pxDropdown){
    	if(dropdownItems && dropdownItems.length>0){

			let defaultStateIdx = _.findIndex(dropdownItems, function(o) { return o.default === true; });

			if(defaultStateIdx > -1){
				pxDropdown.displayValue = dropdownItems[defaultStateIdx].val;
				$state.go(dropdownItems[defaultStateIdx].state, {});
				//push the new app into selected Views?	
			}
    	}
    };

    self.updateSelectedViewOfAMicroApp = function(selectedViews, idx, eventDetail){
    	selectedViews[idx].appName = eventDetail.selectedViewItem.appName;
		selectedViews[idx].selectedState = eventDetail.selectedViewItem.state;
		selectedViews[idx].selectedView = eventDetail.selectedViewItem.val;
		return selectedViews;
    };

    self.addNewMicroAppToState = function(selectedViews, eventDetail){
    	let microAppState = {
		  'appName': eventDetail.selectedViewItem.appName,
	      'selectedState': eventDetail.selectedViewItem.state,
	      'selectedView': eventDetail.selectedViewItem.val
	    };
	    selectedViews.push(microAppState);
	    return selectedViews;
    };

	function recursiveAddChildren(currentRoot){
	    return null;
	};

  }
}

// Strict DI for minification (order is important)
controller.$inject = ['$http', '$state', '$q', '$rootScope', 'AppHubService'];

export default controller;
