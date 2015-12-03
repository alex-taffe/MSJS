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
                    $(".container").load("panel.html", function () {
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

//gets the lessons from the server
function getLessons() {
    $.getJSON("lessons", function (data) {
        if (data.length != 0) {
            var lessonData = "";
            var tempCounter = 1;
            for (var i = 0; i < data.length; i++) {
                if (tempCounter == 1)
                    lessonData += '<div class="row lessonRow">';
                lessonData += '<div class="col-md-3 col-xs-6 lessonCol" data-code="' + data[i]["Code"] + '" onclick="confirmDeleteLesson(this)">';

                var lessonJSON = $.parseJSON(data[i]["JSON"]);
                lessonData += '<h4 class="lessonTitle">'
                lessonData += lessonJSON["lessonTitle"];
                lessonData += '</h4>';

                lessonData += '<h3 class="lessonCode">'
                lessonData += data[i]["Code"];
                lessonData += '</h3>';

                lessonData += '</div>';
                tempCounter++;


                if (tempCounter == 5 || i == data.length - 1) {
                    lessonData += '</div>';
                    tempCounter = 1;
                }
            }
            $("#classes").html(lessonData);
            $("#noLessonWarning").html('');
        }
    });
}

var previousDeleteCode = "";

function confirmDeleteLesson(gridElement) {
    previousDeleteCode = gridElement.getAttribute("data-code");
    $("#deleteModal").modal();
}

function deleteLesson() {

    $.post("lessons", {
        code: previousDeleteCode,
        request: "delete"
    }).done(function (data) {
        var data = $.parseJSON(data);
        if (data["status"] == "Success") {
            getLessons();
            $("#deleteModal").modal("hide");
        }
    });
}

function addLesson() {

    $.post("lessons", {
            request: "add",
            JSON: $("#enterJSON").val()
        })
        .done(function (data) {
            $('#addLessonModal').modal('hide');
            $('#addLessonModal').on('hidden.bs.modal', function (e) {
                $("#enterJSON").val("");
            });
            getLessons();
        });
}

$(document).ready(function () {
    if (debug) {
        $("#panelNav").load("panel-nav.html", function () {});
        $(".container").load("panel.html", null);
        $("#demo-canvas").css('filter', filterVal).css('-webkit-filter', filterVal).css('-moz-filter', filterVal).css('-o-filter', filterVal).css('-ms-filter', filterVal);
    }
    $("#loginModal").on("shown.bs.modal", function () {
        $("#email").focus();
    });
    $("#registerModal").on("shown.bs.modal", function () {
        $("#password2").focus();
    });
});