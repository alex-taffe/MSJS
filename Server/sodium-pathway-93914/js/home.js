$(document).ready(function () {
            function login() {
                $("#loginAlert").html('');
                $("#loginForm").css("visibility", "hidden");
                $("#loginLoader").css("visibility", "visible");
                $.post("login", {
                        email: $("#email").val(),
                        password: $("#password").val()
                    })
                    .done(function (data) {
                        var loginInfo = jQuery.parseJSON(data);
                        if (loginInfo.errorCode == 200) {
                            $('#loginModal').modal('hide');
                            $('#loginModal').on('hidden.bs.modal', function (e) {
                                var filterVal = 'blur(5px)';
                                $("#demo-canvas").css('filter', filterVal).css('-webkit-filter', filterVal).css('-moz-filter', filterVal).css('-o-filter', filterVal).css('-ms-filter', filterVal);
                                $(".container").load("panel.html", function () {
                                    getLessons();
                                    $("#addLesson").click(function () {
                                        $.post("add-lesson", {
                                                JSON: $("#enterJSON").val()
                                            })
                                            .done(function (data) {
                                                $('#addLessonModal').modal('hide');
                                                $('#addLessonModal').on('hidden.bs.modal', function (e) {
                                                    $("#enterJSON").val("");
                                                });
                                                getLessons();
                                            });
                                    });
                                });
                                $("#panelNav").load("panel-nav.html", function () {});
                            });
                        } else {
                            $("#loginAlert").html('<div class="alert in alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + loginInfo.message + '</div>');
                            $("#password").val("");
                            $("#loginForm").css("visibility", "visible");
                            $("#loginLoader").css("visibility", "hidden");
                        }
                    });
            };

            function register() {
                $("#registerAlert").html('');
                $("#registerForm").css("visibility", "hidden");
                $("#registerLoader").css("visibility", "visible");
                var recaptcha = null;
                if (typeof grecaptcha !== 'undefined')
                    recaptcha = grecaptcha.getResponse();
                $.post("register", {
                        email: $("#email").val(),
                        password: $("#password").val(),
                        password2: $("#password2").val(),
                        "g-recaptcha-response": recaptcha
                    })
                    .done(function (data) {
                        var registerInfo = jQuery.parseJSON(data);
                        if (registerInfo.errorCode == 200) {
                            $('#registerModal').modal('hide');
                            $('#registerModal').on('hidden.bs.modal', function (e) {
                                login();
                            });
                        } else {
                            $("#registerAlert").html('<div class="alert in alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + registerInfo.message + '</div>');
                            $("#password").val("");
                            $("#password2").val("");
                            $("#registerForm").css("visibility", "visible");
                            $("#registerLoader").css("visibility", "hidden");
                        }
                    });
            }
            $(".loginLogin").click(function () {
                login();
            });
            $("#registerFinal").click(function () {
                register();
            });
        });

        function getLessons() {
            $.getJSON("lessons", function (data) {
                if (data.length != 0) {
                    var lessonData = "";
                    var tempCounter = 1;
                    for (var i = 0; i < data.length; i++) {
                        if (tempCounter == 1)
                            lessonData += '<div class="row lessonRow">';
                        lessonData += '<div class="col-md-3 col-xs-6 lessonCol">';

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