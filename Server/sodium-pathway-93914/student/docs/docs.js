$(document).ready(function () {
    var finalHTML = "";
    $.getJSON("docs/docs.json", function (data) {
        var classes = data["classes"];
        console.log(classes);
        //console.log(classes);
        for (var i = 0; i < classes.length; i++) {
            var className = classes[i].name;
            finalHTML += "<h2 class='classTitle'>" + className + "</h2>";
            var constructors = classes[i].constructors;
            if (constructors != null && constructors.length != 0) {
                finalHTML += "<h3 class='sectionHeader'>Constructors</h3>";
                for (var j = 0; j < constructors.length; j++) {
                    finalHTML += "<div class='card surroundCard'>";
                    finalHTML += "<div class='card-header methodName'>" + constructors[j].methodName + "</div>";
                    finalHTML += "<div class='card-block'>" + constructors[j].description + "</div>";
                    finalHTML += "</div>";
                }
            }
            var properties = classes[i].properties;
            if (properties != null && properties.length != 0) {
                finalHTML += "<h3 class='sectionHeader'>Properties</h3>";
                for (var j = 0; j < properties.length; j++) {
                    finalHTML += "<div class='card surroundCard'>";
                    finalHTML += properties[j].name;
                    finalHTML += "</div>";
                }
            }
            var methods = classes[i].methods;
            if (methods != null && methods.length != 0) {
                finalHTML += "<h3 class='sectionHeader'>Methods</h3>";
                for (var j = 0; j < methods.length; j++) {
                    finalHTML += "<div class='card surroundCard'>";
                    finalHTML += "<div class='card-header methodName'>" + methods[j].methodName + "</div>";
                    finalHTML += "<div class='card-block'>Type: <div class='card methodType'>" + methods[j].type + "</div><br>";
                    finalHTML += methods[j].description + "</div>";
                    finalHTML += "</div>";
                }
            }
            if (i != classes.length - 1)
                finalHTML += "<hr>";
        }
        $("#documentation").html(finalHTML);
    });
});