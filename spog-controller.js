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

	    self.updateViewsDisplayIfLocationChanges();

	}); 

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
    		var currentAppName = viewMenuItems.appName;
    		var currentState = AppHubService.getState();
    		var preSelectedViewExists = false;
    		
	        if(currentState){
	        	if(currentState.selectedViews){
	        		
	        		var appIdx = _.findIndex(currentState.selectedViews, function(o) { return o.appName == currentAppName; });	
	        		//The Current App name is in CurrentState
					if(appIdx > -1){
						if(pxDropDownElement && pxDropDownElement.dropdownItems){
							var dropdownIdx = _.findIndex(pxDropDownElement.dropdownItems, function(o) { return o.val === currentState.selectedViews[appIdx].selectedView; });	
	        				if(dropdownIdx > -1){
	        					preSelectedViewExists = true;
	        					pxDropDownElement.displayValue = pxDropDownElement.dropdownItems[dropdownIdx].val;
								$state.go(pxDropDownElement.dropdownItems[dropdownIdx].state, {});
							}
	        			}
					}
				}
	        }

			if(!preSelectedViewExists){
				self.goToDefaultState(viewMenuItems.dropdownItems, pxDropDownElement);
			}
	    }
	};

	self.navigateToSelectedView = function (){
    	var viewMenuItems = document.querySelector('view-menu-items');

    	if(viewMenuItems){
    		viewMenuItems.addEventListener('selectedViewItemChanged', function(evt){
    			if(evt.detail){
		    		if(evt.detail.selectedViewItem){
		    			self.updateCurrentState(evt.detail.selectedViewItem.appName, evt.detail.selectedViewItem);
		    			$state.go(evt.detail.selectedViewItem.state, {});
		    		}
		    	}
		    }, false);
    	}
	};

	self.updateCurrentState = function(appName, selectedViewItem){
		var currentState = AppHubService.getState();
		var appNameOfSelectedViewFoundInState = false;

		if(currentState){
			if(currentState.selectedViews){								
				var appIdx = _.findIndex(currentState.selectedViews, function(o) { return o.appName === appName; });
				//The app state is already in SessionState, just update View value
				if(appIdx > -1){
					appNameOfSelectedViewFoundInState = true;
					currentState.selectedViews = self.updateSelectedViewOfAMicroApp(currentState.selectedViews, appIdx, selectedViewItem);
				}
			}
        }
        if(!appNameOfSelectedViewFoundInState){
        	if(!currentState){ currentState = {}; }
	    	if(!currentState.selectedViews){ currentState.selectedViews = []; }
	    	currentState.selectedViews = self.addNewMicroAppToState(currentState.selectedViews, selectedViewItem);
        }

		AppHubService.setState(currentState);
	};

    self.goToDefaultState = function(dropdownItems, pxDropdown){
    	if(dropdownItems && dropdownItems.length>0){

			var defaultStateIdx = _.findIndex(dropdownItems, function(o) { return o.default === true; });
			if(defaultStateIdx > -1){
				pxDropdown.displayValue = dropdownItems[defaultStateIdx].val;
				self.updateCurrentState(dropdownItems[defaultStateIdx].appName, dropdownItems[defaultStateIdx]);
	    		$state.go(dropdownItems[defaultStateIdx].state, {});
			}
    	}
    };

    self.updateViewsDisplayIfLocationChanges = function(){
    	window.addEventListener("hashchange",function(event){
    		self.locationHashChanged(event);
    	});
    };

    self.locationHashChanged = function(event){
    	var viewMenuItems = document.querySelector('view-menu-items');
		var pxDropdown = document.querySelector("#pxDropdown");
		var locationHashIdx = -1;
		var locationHash = '';

		if(window.location){
			if(window.location.hash){
			  locationHash = '/' + window.location.hash;
			}
		}

		if(viewMenuItems){
			if(viewMenuItems.dropdownItems){
				locationHashIdx = _.findIndex(viewMenuItems.dropdownItems, function(o){ return o.path === locationHash });
				if(locationHashIdx > -1){
	    			if(pxDropdown){
	    				pxDropdown.displayValue = viewMenuItems.dropdownItems[locationHashIdx].val;
	    				self.updateCurrentState(viewMenuItems.dropdownItems[locationHashIdx].appName, viewMenuItems.dropdownItems[locationHashIdx]);
	    			}
	    		}
			}
		}

	};

    self.updateSelectedViewOfAMicroApp = function(selectedViews, idx, selectedViewItem){
    	selectedViews[idx].appName = selectedViewItem.appName;
		selectedViews[idx].selectedState = selectedViewItem.state;
		selectedViews[idx].selectedView = selectedViewItem.val;
		return selectedViews;
    };

    self.addNewMicroAppToState = function(selectedViews, selectedViewItem){
    	var microAppState = {
		  'appName': selectedViewItem.appName,
	      'selectedState': selectedViewItem.state,
	      'selectedView': selectedViewItem.val
	    };
	    selectedViews.push(microAppState);
	    return selectedViews;
    };
  }
}

// Strict DI for minification (order is important)
controller.$inject = ['$http', '$state', '$q', '$rootScope', 'AppHubService'];

export default controller;
