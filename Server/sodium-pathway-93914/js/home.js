var debug = false;

//check the email field to see if the enter key has been pressed and if so, move to the password field
function checkNext(e) {
    if (e.keyCode == 13) {
        $("#password").focus();
    }
}
//check the password field to see if the enter key has been pressed and if so, try logging in
function checkLogin(e) {
    if (e.keyCode == 13) {
        login();
    }
}
//log the user in
function login() {
    //reset the login error message, hide the form, display the loading icon
    $("#loginAlert").html('');
    $("#loginForm").css("visibility", "hidden");
    $("#loginLoader").css("visibility", "visible");
    //query the server to see if it's right
    $.post("login", {
            email: $("#email").val(),
            password: $("#password").val()
        })
        .done(function (data) {
            //we got a response
            var loginInfo = jQuery.parseJSON(data);
            //200 means they got everything right, move on to panel
            if (loginInfo.errorCode == 200) {
                //hide login modal
                $('#loginModal').modal('hide');
                $('#loginModal').on('hidden.bs.modal', function (e) {
                    //blur background
                    var filterVal = 'blur(5px)';
                    $("#demo-canvas").css('filter', filterVal).css('-webkit-filter', filterVal).css('-moz-filter', filterVal).css('-o-filter', filterVal).css('-ms-filter', filterVal);
                    //load in the panel and get the lessons
                    $(".container").load("panel-lessons.html", function () {
                        getLessons();
                    });
                    $("#panelNav").load("panel-nav.html", function () {});
                });
            }
            //fools screwed up their passwords
            else {
                //let them know what they've done wrong, reset the password field, bring back the form, hide the loader
                $("#loginAlert").html('<div class="alert in alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + loginInfo.message + '</div>');
                $("#password").val("");
                $("#loginForm").css("visibility", "visible");
                $("#loginLoader").css("visibility", "hidden");
            }
        });
};


function register() {
    //reset the register error message, hide the form, display the loading icon
    $("#registerAlert").html('');
    $("#registerForm").css("visibility", "hidden");
    $("#registerLoader").css("visibility", "visible");
    //see if the recaptcha has loaded. If not, we're not going to submit it with the form, but the server knows what to do
    var recaptcha = null;
    if (typeof grecaptcha !== 'undefined')
        recaptcha = grecaptcha.getResponse();
    //try registering them
    $.post("register", {
            email: $("#email").val(),
            password: $("#password").val(),
            password2: $("#password2").val(),
            "g-recaptcha-response": recaptcha
        })
        .done(function (data) {
            //we got a response, let's encode it
            var registerInfo = jQuery.parseJSON(data);
            //they registered successfully
            if (registerInfo.errorCode == 200) {
                //hide the registration modal, trigger the login script to get them into the panel
                $('#registerModal').modal('hide');
                $('#registerModal').on('hidden.bs.modal', function (e) {
                    login();
                });
            }
            //morons screwed up the easiest part of the website
            else {
                //display an alert, reset the password fields, return the form visability, get rid of the loader
                $("#registerAlert").html('<div class="alert in alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + registerInfo.message + '</div>');
                $("#password").val("");
                $("#password2").val("");
                $("#registerForm").css("visibility", "visible");
                $("#registerLoader").css("visibility", "hidden");
            }
        });
}
//login button was clicked, try login
$(".loginLogin").click(function () {
    login();
});
//register button was clicked, try register
$("#registerFinal").click(function () {
    register();
});

//called when the user clicks an item in the navigational menu
function changeNav(destinationItem) {
    var destination = destinationItem.getAttribute("data-title");
    var elementsToRemoveActive = ["classLink", "accountLink", "statLink"];
    for (var i = 0; i < elementsToRemoveActive.length; i++) {
        document.getElementById(elementsToRemoveActive[i]).className = document.getElementById(elementsToRemoveActive[i]).className.replace(/(?:^|\s)active(?!\S)/g, '');
    }
    if (destination == "classes") {
        document.getElementById("classLink").className += "active";
        $(".container").load("panel-lessons.html", function () {
            getLessons();
        });
    } else if (destination == "stats") {
        document.getElementById("statLink").className += "active";
        $(".container").load("panel-stats.html", function () {

        });
    } else if (destination == "account") {
        document.getElementById("accountLink").className += "active";
        $(".container").load("panel-account.html", function () {

        });
    }
}

function goFullScreen(gridItem) {
    if (gridItem.requestFullScreen)
        gridItem.requestFullScreen();
    else if (gridItem.msRequestFullscreen)
        gridItem.msRequestFullscreen();
    else if (gridItem.mozRequestFullScreen)
        gridItem.mozRequestFullScreen();
    else if (gridItem.webkitRequestFullScreen)
        gridItem.webkitRequestFullScreen();
    var canvas = document.getElementById("demo-canvas");
    $(gridItem).css("background", "element(#demo-canvas)");
}

//gets the lessons from the server and adds them to the UI
function getLessons() {
    $.getJSON("lessons", function (data) {
        //we have the server data
        if (data.length != 0) {
            //there's at least one lesson, so let's initialize the data we need
            var lessonData = "";
            var tempCounter = 1;
            for (var i = 0; i < data.length; i++) {
                //if this is the beginning of a new row, we need to add a new row
                if (tempCounter == 1)
                    lessonData += '<div class="row lessonRow">';
                //card
                lessonData += '<div class="col-md-3 col-xs-6 lessonCol" data-code="' + data[i]["Code"] + '" onclick="goFullScreen(this)">';
                lessonData += '<button type="button" class="close" aria-label="Close" onclick="confirmDeleteLesson(this.parentNode)"><span aria-hidden="true">×</span></button>';

                var lessonJSON = $.parseJSON(data[i]["JSON"]);
                lessonData += '<h4 class="lessonTitle">'
                lessonData += lessonJSON["lessonTitle"];
                lessonData += '</h4>';

                lessonData += '<h3 class="lessonCode">'
                lessonData += data[i]["Code"];
                lessonData += '</h3>';

                lessonData += '</div>';
                //end card
                tempCounter++;

                //if this is the end of the row, add a new div and reset the counter
                if (tempCounter == 5 || i == data.length - 1) {
                    lessonData += '</div>';
                    tempCounter = 1;
                }
            }
            //add the lessons to the view and remove the warning that there are no lessons
            $("#classes").html(lessonData);
            $("#noLessonWarning").html('');
        }
    });
}
//used so we know what lesson needs to be deleted when the user clicks confirm
var previousDeleteCode = "";

//make sure the user actually wants to delete the lesson and get the code of the lesson they want to delete
function confirmDeleteLesson(gridElement) {
    previousDeleteCode = gridElement.getAttribute("data-code");
    $("#deleteModal").modal();
}

//actually delete the lesson
function deleteLesson() {
    //notify the server of what lesson we want to delete
    $.post("lessons", {
        code: previousDeleteCode,
        request: "delete"
    }).done(function (data) {
        var data = $.parseJSON(data);
        if (data["status"] == "Success") {
            //the lesson got deleted, so refresh the lesson list and hide the deletion modal
            getLessons();
            $("#deleteModal").modal("hide");
        }
    });
}

//confirm with the user that they really want to delete their account
function confirmAccountDelete() {
    $("#accountDeleteModal").modal();
}

//change password
function changePassword() {
    var password = $("#password").val();
    var confirmPassword = $("#confirmPassword").val();
    $.post("account", {
        request: "passwordUpdate",
        password1: password,
        password2: confirmPassword
    }).done(function (data) {
        alert(data);
    });
}

//delete the account
function deleteAccount() {
    $.post("account", {
            request: "delete"
        })
        .done(function (data) {
            $.get("logout").done(function () {
                location.reload();
            });
        });
}

//add a new lesson
function addLesson() {
    //notify the server that we want to add a new lesson
    $.post("lessons", {
            request: "add",
            JSON: $("#enterJSON").val()
        })
        .done(function (data) {
            //the lesson got added, hide the modal, reset the JSON text entry field, refresh the lessons
            $('#addLessonModal').modal('hide');
            $('#addLessonModal').on('hidden.bs.modal', function (e) {
                $("#enterJSON").val("");
            });
            getLessons();
        });
}

//document load
$(document).ready(function () {
    //if debug is triggered, show the panel without logging in
    if (debug) {
        $("#panelNav").load("panel-nav.html", function () {});
        $(".container").load("panel.html", null);
        $("#demo-canvas").css('filter', filterVal).css('-webkit-filter', filterVal).css('-moz-filter', filterVal).css('-o-filter', filterVal).css('-ms-filter', filterVal);
    }
    //focus the email field on login modal show
    $("#loginModal").on("shown.bs.modal", function () {
        $("#email").focus();
    });
    //focus the password field on register modal show
    $("#registerModal").on("shown.bs.modal", function () {
        $("#password2").focus();
    });
});