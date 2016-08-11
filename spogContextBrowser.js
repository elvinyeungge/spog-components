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
    //get our url - if there's no valid nodeId, resolve an empty promise.
    // if (nodeIds[nodeId]) {
    //     ironAjaxEl.url = nodeIds[nodeId];
    //     //and generate the promise.
    //     ironAjaxEl.generateRequest();
    // } else if(node){
    //     deferred.resolve({ data: node.children, meta: { parentId: nodeId } });
    //     //var data = apmCall(node);
    //     // setTimeout(deferred.resolve({data:apmCall(node),meta:{parentId:nodeId}}),3000);
    // } else {
    //   deferred.resolve({ data: [], meta: { parentId: nodeId } });
    // }
    $injector = angular.injector(['ng']);
    http = $injector.get('$http');
    var parent;
    if(!node.uri){
        parent = 'null';
    } else {
        parent = node.uri;
    }
    //url to call to apm - parent comes from node. null returns enterprises
    var url = 'contextbrowser/api/allInstances?parent=' + parent;
    // console.log("NODE");
    // console.log(node);

    //call itself
    http.get(url)
        .then(function(response){
            // console.log("RESPONSE");
            // console.log(response.data);
            if(response.data.length>0){
                for(var ii=0;ii<response.data.length;ii++){
                    //add identifiers to children
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
        }); //eo http.get.then
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
