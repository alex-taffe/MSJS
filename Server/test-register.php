<!doctype html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Untitled Document</title>
    <script src='https://www.google.com/recaptcha/api.js'></script>
</head>

<body>



    <form action="register" method="post" id="loginForm">
        <input type="hidden" name="ac" value="log">
        <h1 class="contentHeader">Account Register</h1>
        <input name="email" id="email" type="email" class="login user" placeholder="Email">
        <input type="password" name="password" id="password" class="login password" placeholder="Password" >
        <input type="password" name="password2" id="password" class="login password" placeholder="Password" >
        <div class="g-recaptcha" data-sitekey="6LfjXAcTAAAAADwKNboGYMSuig01jWJE4Lk3kQR5"></div>
        <input type="submit" value="Submit">
    </form>

</body>

</html>