function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function login() {
    var username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter a username.");
        return false;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/login', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = function() {
    var response = JSON.parse(this.responseText);
    if (response.status === "Logged in!") {
        var username = document.getElementById('username').value;
        setCookie("username", username, 1); // Set cookie when logged in
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-page').style.display = 'block';
        getTweets();
    } else {
        // Handle case where login is not successful
        alert("Login failed: " + response.status);
    }
};
    var data = {
        username: document.getElementById('username').value
    };
    xhr.send(JSON.stringify(data));
    return false; // 防止表单提交导致的页面刷新
}
var username;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function getTweets() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/tweet', true);
    xhr.onload = function() {
        if (this.status == 200) {
            var tweets = JSON.parse(this.responseText);
            var output = '';
            for (var i in tweets) {
                output += '<li>' +
                    tweets[i].content + ' by ' + tweets[i].username +
                    ' <button onclick="updateTweet(' + tweets[i].id + ')">Update</button>' +  // 这里添加Update按钮
                    '</li>';
            }
            document.getElementById('tweets').innerHTML = output;
        }
    }
    xhr.send();
}

function postTweet() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/tweet', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = function() {
        if (this.status == 201) {
            getTweets(); // 重新加载推文
        }
    }
    var data = {
        content: document.getElementById('tweet').value,
        username: getCookie('username')
    };
    xhr.send(JSON.stringify(data));
}
function updateTweet(id) {
    var updatedContent = prompt("Update your tweet:", "");
    if (updatedContent !== null) {
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', `/api/tweet/${id}`, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onload = function() {
            if (this.status == 200) {
                getTweets(); // refresh the displayed tweets after updating
            }
        }
        var data = {
            content: updatedContent,
            username: getCookie('username')
        };
        xhr.send(JSON.stringify(data));
    }
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}



window.onload = function() {
    // 尝试从cookie中获取username
    username = getCookie('username');
    if(username) {
        // 如果用户已经登录，隐藏登录页面，显示主页面并获取推文
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-page').style.display = 'block';
        getTweets();
    } else {
        // 从 URL 获取 username，如果是从登录页面跳转过来的
        var urlUsername = getParameterByName('username');
        if(urlUsername) {
            setCookie("username", urlUsername, 1);
            username = urlUsername;
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('main-page').style.display = 'block';
            getTweets();
        } else {
            // 如果没有登录，显示登录页面
            document.getElementById('login-page').style.display = 'block';
            document.getElementById('main-page').style.display = 'none';
        }
    }
}

