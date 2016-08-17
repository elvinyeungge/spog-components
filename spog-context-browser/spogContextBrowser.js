/**
 -----------------------CONFIGURATIONS-------------------------------------------
 Change this variable to however many columns you want to display
 */
var numberOfColumns = 3;

//Change this if you want your context browser to display ALL the children
var showAllChildren = false;
//------------------------------------------------------------------------------


function demoGetChildren(node) {
    $injector = angular.injector(['ng']);
    q = $injector.get('$q');
    var nodeId = node.identifier,
        deferred = q.defer(),
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
    $injector = angular.injector(['ng']);
    http = $injector.get('$http');
    var parent;
    if(!node.uri){
        parent = 'null';
    } else {
        parent = node.uri;
    }
    //url to apm service- parent comes from node. parent=null returns enterprises
    //contextbrowser/api/ is our reverse proxy
    var url = 'contextbrowser/api/allInstances?parent=' + parent;
    //the http request 
    http.get(url)
        .then(function(response){
            if(response.data.length>0){
                for(var ii=0;ii<response.data.length;ii++){
                    //add attributes to children. identifier is necessary for the browser to open the next column
                    response.data[ii]['identifier'] = node.identifier + ('a' + ii);
                    response.data[ii]['hasChildren'] = true;
                    //response.data[ii]['isOpenable'] = true;
                }
            }
            if(nodeId){
                var pId = nodeId;
            } else{
                nodeId = node.name;
            }
            deferred.resolve({data:response.data,meta:{parentId:nodeId}});
        });
    //don't forget to return the promise!
    return deferred.promise;
}

window.addEventListener('WebComponentsReady', function() {
    var counter = 0;
    var colBrowser = document.querySelector('px-context-browser');
    colBrowser.handlers = {
        getChildren: function(parent, newIndex) {
            return demoGetChildren(parent);
        },
        itemOpenHandler: function(context) {
            console.log('Opened: ', context);
        }
    };
});
function recursiveAddChildren(currentRoot){
    return null;
}
