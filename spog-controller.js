import angular from 'angular';
class controller {

  constructor($http, $state, $q, $rootScope, $scope, $timeout, $interval, AppHubService){
  	this.init($http, $state, $q, $rootScope, $scope, $timeout, $interval, AppHubService);
  }

  init($http, $state, $q, $rootScope, $scope, $timeout, $interval, AppHubService){
  	var self = this;
  	var onPageLoad =  true;
	var autoClickOpen = true;
	angular.element(document).ready(function() {
		var counter = 0;
		if(!window.chrome){
			self.intervalToFetchContextBrowser = $interval(function() {
				self.fetchContextBrowser();	
			}, 500, 20);
		}else {
			self.fetchContextBrowser();
		}
		self.navigateToSelectedView();

		var data = JSON.parse(window.sessionStorage.getItem('selectedIds'));
		if(data){
			var div = '<div class="pxh-spinner pxh-spinner--large persisting-context-spinner" style="top:26%; right:46.5%; position:fixed;"></div>'; 
		    document.querySelector('header').insertAdjacentHTML('beforeend', div);
		}
	});
	
	self.fetchContextBrowser = function(){
		var colBrowser = document.querySelector('px-context-browser');
		if(colBrowser){
			self.initContextBrowser(colBrowser);
		}
	};

	self.initContextBrowser = function(browser){
		$interval.cancel(self.intervalToFetchContextBrowser);
		//initial context call for first column
		$http.get('contextbrowser/api/allInstances?components=BASIC&parent=null')
	        .then(function(response){
	            if(response.data.length>0){
	                for(var ii=0;ii<response.data.length;ii++){
	                    //add identifiers to children
	                    response.data[ii]['identifier'] = '00-' + ii;
	                    response.data[ii]['hasChildren'] = true;
	                    response.data[ii]['isOpenable'] = true;
	                }
	                browser.browserContext=initialContext(response.data);
	                var data = JSON.parse(window.sessionStorage.getItem('selectedIds'));
					if(data){
		                persistingContextBrowser('enterprises');
		            }
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
	    var url = 'contextbrowser/api/allInstances?components=BASIC&parent=' + parent;
	    //call itself
	    $http.get(url)
	        .then(function(response){
	            if(response.data.length>0){
	                for(var ii=0;ii<response.data.length;ii++){
	                    response.data[ii]['identifier'] = node.identifier + ('a' + ii);
	                    response.data[ii]['hasChildren'] = true;
	                    response.data[ii]['isOpenable'] = true;
	                }
	                if(onPageLoad){
						if(parent.includes("enterprises")){
		                	persistingContextBrowser('sites');
		                }
		                else if(parent.includes("sites")){
		                	persistingContextBrowser('segments');
		                }
		                else if(parent.includes("segments")){
		                	persistingContextBrowser('assets');
		                }
		            }
	                else if(autoClickOpen && !onPageLoad){
	                	var colBrowser = document.querySelector('px-context-browser');
	                	colBrowser.querySelector('.openable').click();
	                } 
	                autoClickOpen = false; 
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
	function persistingContextBrowser(val){
		var data = JSON.parse(window.sessionStorage.getItem('selectedIds'));
		if(data){
	        var persistingContextBrowser = data[val];
	        setTimeout(function(){
	          var span = document.querySelectorAll('span');
	          for(var si=0; si < span.length; si++){
	            var eventSpan = span[si].innerHTML;
	            var eventName = persistingContextBrowser.name;
	            if(eventSpan == eventName){
	              span[si].click();
	              if(val == 'enterprises'){
	              	if(!data['sites']){	closePersistingContextBrowser(); }
	          	  }
	              else if(val == 'sites'){
	              	if(!data['segements']){ closePersistingContextBrowser(); }
	              }
	              else if(val == 'segements'){
	              	if(!data['assets']){ closePersistingContextBrowser(); }
	              }
	              else if(val == 'assets'){ 
	              	closePersistingContextBrowser();
	              }
	              break;
	            }
	          }
	      	},1000);
	    }
	}

	function closePersistingContextBrowser(){
		var elem = document.getElementsByClassName("persisting-context-spinner");
		if(elem){ elem[0].remove(); }
		var colBrowser = document.querySelector('px-context-browser');
    	colBrowser.querySelector('h1').click();   	
    	onPageLoad = false;
	} 

	function initialContext(data){
		var obj = {};
		obj.data=data;
		obj.meta={ "parentId": null };
		return obj;
	};

	self.defaultToPreSelectedView = function (){ 
		var viewMenuItems = document.getElementsByTagName('view-menu-items')[0] ||  document.querySelector('view-menu-items');
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
						if(pxDropDownElement && viewMenuItems.dropdownItems){
							var dropdownIdx = _.findIndex(viewMenuItems.dropdownItems, function(o) { return o.val === currentState.selectedViews[appIdx].selectedView; });	
	        				if(dropdownIdx > -1){
	        					preSelectedViewExists = true;
	        					pxDropDownElement.displayValue = viewMenuItems.dropdownItems[dropdownIdx].val;
								$state.go(viewMenuItems.dropdownItems[dropdownIdx].state, {});
	        					$interval.cancel(self.intervalToFetchViewMenuItems);
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
    	window.addEventListener('selectedViewItemChanged', function(evt){
			if(evt.detail){
	    		if(evt.detail.selectedViewItem){
	    			self.updateCurrentState(evt.detail.selectedViewItem.appName, evt.detail.selectedViewItem);
	    			$state.go(evt.detail.selectedViewItem.state, {});
	    		}
	    	}
	    }, false);
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
				$state.go(dropdownItems[defaultStateIdx].state, {});
	    		$interval.cancel(self.intervalToFetchViewMenuItems);
	        }
    	}
    };

    self.updateViewsDisplayIfLocationChanges = function(){
    	window.addEventListener("hashchange",function(event){
    		self.locationHashChanged(event);
    	});
    };

	self.locationHashChanged = function(event, toState,  toParams, fromState, fromParams){
		var viewMenuItems = document.querySelector('view-menu-items');
		var pxDropdown = document.querySelector("#pxDropdown");
		var locationHashIdx = -1;
		var locationHash = '';

		if(viewMenuItems){
			if(viewMenuItems.dropdownItems){
				locationHashIdx = _.findIndex(viewMenuItems.dropdownItems, function(o){ return o.path.split("/")[2] === toState.name });
				if(locationHashIdx > -1){
	    			if(pxDropdown){
	    				pxDropdown.displayValue = viewMenuItems.dropdownItems[locationHashIdx].val;
						$interval.cancel(self.intervalToFetchViewMenuItems);
	    				self.updateCurrentState(viewMenuItems.dropdownItems[locationHashIdx].appName, viewMenuItems.dropdownItems[locationHashIdx]);
	    			}
	    		}
	    	}
		}
	};

	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
		if(self.intervalToFetchViewMenuItems){
			$interval.cancel(self.intervalToFetchViewMenuItems);
		}

		var changeInMicroApp = false;
		if(fromState.name === ""){
			changeInMicroApp = true;
		}

		if(changeInMicroApp){
			if(window.chrome){
				self.defaultToPreSelectedView();
			}else{
				self.checkIfViewMenuItems();		
			}
		}else{
			self.locationHashChanged(event, toState,  toParams, fromState, fromParams);
		}
    });

	self.checkIfViewMenuItems = function() {
    	self.intervalToFetchViewMenuItems = $interval(function() {
    		var viewMenuItems = document.getElementsByTagName('view-menu-items')[0] ||  document.querySelector('view-menu-items');		
        	if(viewMenuItems){
            	self.defaultToPreSelectedView();
	        }
	        // else{
	        // 	debugger;
	        // 	self.checkIfViewMenuItems();
	        // }
		}, 500, 20);
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

    $scope.$on('destroy', function(){
    	$interval.cancel(self.intervalToFetchViewMenuItems);
    	$interval.cancel(self.intervalToFetchContextBrowser);
    });

  }
}

// Strict DI for minification (order is important)
controller.$inject = ['$http', '$state', '$q', '$rootScope', '$scope', '$timeout', '$interval', 'AppHubService'];

export default controller;