

var xmlHttpOption;                         // XML HTTP object for option
var onSuccess;                             // page to go to once the option has been set (in the onload)
var baseURL;                               // this is set by the java side
var optionsURL = "options/";
var hierarchyURL = "hierarchy/";

////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(){
    // add a listener to the render labels checkbox
    $("#renderLabels").click(function(e){
        var rendererName = "frag";
        if (document.getElementById("rendererForm").renderLabels.checked){
            rendererName = "label";
        }
        option("optionRenderer", rendererName, null);
    });

    createSlideToggles();

    // add a listener to unexpanded tree nodes
    $("li > span.expandable").click(function(e){
        handleExpand($(this).parent());
    });
});

// add a listener for all codeboxes
function createSlideToggles() {
    $("<img class=\"min\" src=\"../../images/min.png\" width=\"16\" height=\"16\"/>").click(function(e){
        $(this).next(".codebox").slideToggle('fast');
    }).insertBefore(".codebox");
}

function optionFromSelect(select){
    Item = select.selectedIndex;
    Result = select.options[Item].text;
    optionId = select.form.id; // get the ID of the form

    option(optionId, Result, null);
}

// successPage is optional
// - if specified, this page will be loaded when the option is set successfully
// - if omitted, the current page will be refreshed when the option is set successfully
function option(opt, value, successpage){

    xmlHttpOption=GetXmlHttpObject(optionSet);

    if (xmlHttpOption==null) {
        alert ("Browser does not support HTTP Request");
    }
    else{
        xmlHttpOption.open("POST", baseURL + optionsURL, true);

        xmlHttpOption.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");

        var attrs =  "property=" + opt + "&value=" + value + "&format=xml";

        onSuccess = successpage;

        xmlHttpOption.send(attrs);
    }
}

function optionSet(){
    if (xmlHttpOption.readyState==4 || xmlHttpOption.readyState=="complete") {
        if (onSuccess != null){
            if (parent != null){
                parent.window.location = onSuccess;
            }
            else{
                window.location = onSuccess;
            }
        }
        else{
            reloadAllFrames();
        }
    }
}

function reloadAllFrames(){
    if (parent.frames.length > 0){
        for(var i=0; i<parent.frames.length; i++){
            var sURL = parent.frames[i].location;
            parent.frames[i].location.replace(sURL);
        }
    }
    else{
        // we have to strip out the session if it is in the url
        // otherwise the previous state will just be reloaded
        var url = location.toString();
        url = url.replace(/[&|?]session=[^&]+/, "");
        location.replace(url);
    }
}

function getContentURL(){
    if (parent.frames.length > 0){
        return parent.frames["content"].location;
    }
    else{
        return ONT_SERVER;
    }
}

function GetXmlHttpObject(callback) {
    var objXMLHttp=null;
    if (window.XMLHttpRequest) {
        objXMLHttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {
        objXMLHttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    objXMLHttp.onreadystatechange=callback;
    return objXMLHttp;
}

function handleExpand(li){
    var children = $("ul", li);
    if (children.length > 0){
        children.slideToggle('fast');
    }
    else{
        li.append(getChildren(li));
    }
}

function getChildren(li){
    var childList = $("<ul><li><img src=\"../../images/small_busy.gif\" width=\"10\" height=\"10\"/></li></ul>");

    var data = {
        format: "html-frag",
        parent: $("a", li).attr("title"),
        cls: $(".minihierarchy").attr("class") // will leave the service to split
    };
    $.ajax({
        url: baseURL + hierarchyURL,
        data: data,
        context: li,
        success: function(data, textStatus, request){
            this.html(data); // replace the li with an expanded version
            // and add the expand click listener to the new nodes
            $("span.expandable", this).click(function(e){
                handleExpand($(this).parent());
            })
        },
        error: function(request, textStatus, errorThrown){
            // get rid of the spinner and replace with an error message
            $("ul", this).html("Sorry, cannot get children");
        }
    });

    return childList;
}