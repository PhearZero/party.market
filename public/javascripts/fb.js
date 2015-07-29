window.fbAsyncInit = function() {
    FB.init({
        appId      : '124709774536650',
        xfbml      : true,
        version    : 'v2.4'
    });

    // ADD ADDITIONAL FACEBOOK CODE HERE
    // Place following code after FB.init call.

    function onLogin(response) {
        if (response.status == 'connected') {
            //FB.api('/me?fields=first_name', function(data) {
            //    var welcomeBlock = document.getElementById('fb-welcome');
            //    welcomeBlock.innerHTML = 'Hello, ' + data.first_name + '!';
            //});
            FB.api('/956681651041128/events', function(response) {
                console.log(response);
                var welcomeBlock = document.getElementById('fb-welcome');
                welcomeBlock.innerHTML = 'Helloz, ' + response + '!';
            });
        }
    }


    FB.getLoginStatus(function(response) {
        // Check login status on load, and if the user is
        // already logged in, go directly to the welcome message.
        if (response.status == 'connected') {
            onLogin(response);
        } else {
            // Otherwise, show Login dialog first.
            FB.login(function(response) {
                onLogin(response);
            }, {scope: 'user_friends, email'});
        }
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));