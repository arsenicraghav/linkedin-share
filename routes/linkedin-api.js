'use strict';
var config = require('../config');
var url = require('url');
var https = require('https');
var Linkedin = require('node-linkedin')

if (config.localDb) {
    var pg = require('pg')
    var conString = "postgres://postgres:test@123@localhost:5433/postgres";
    var client = new pg.Client(conString);
}

var payload;
var userData = {};

exports.share = function (req, res) {

    var id = req.params.id;
    var firstname = req.params.firstname;
    var lastname = req.params.lastname;
    var email = req.params.email;

    userData.id = id;
    userData.firstname = firstname;
    userData.lastname = lastname;
    userData.email = email;

    var title = firstname + " " + lastname;
    var submittedUrl = config.websiteLink;
    var submittedImageUrl = config.logo;

    payload = {
        "comment": new Date().toTimeString(),
        "content": {
            "title": title,
            "submitted-url": submittedUrl,
            "submitted-image-url": submittedImageUrl
        },
        "visibility": {
            "code": "anyone"
        }
    }
    var authrorisationCodeURL = generateAuthorisationCodeURL();
    res.send({'Location': authrorisationCodeURL, 'redirect': true});

};

exports.redirect_callback = function (req, res) {
    var authCode = getAuthorisationCode(req);
    if (authCode) {
        getAccessToken(authCode, function (access_token) {
            if (access_token) {
                console.log(access_token);
                sharePost(access_token, function (sharedPost) {
                    if (config.localDb) {
                        insert();
                    }
                    console.log(sharedPost.updateUrl);
                    console.log(userData);
                    res.render('index', {
                        payload: {
                            count: '1',
                            sharedPostUrl: sharedPost.updateUrl,
                            userData: userData
                        }
                    });
                    res.end();
                });
            } else {
                res.send({});
                res.end();
            }
        });
    } else {
        res.send({});
        res.end();
    }
}

var sharePost = function (access_token, callback) {

    var LinkedinService = Linkedin(config.clientId, config.clientSecret);

    var linkedin = LinkedinService.init(access_token);

    linkedin.people.share(payload, function (err, data) {
        console.log(data);
        callback(data);
    });
};

var generateAuthorisationCodeURL = function () {

    var authrorisationCodeURL = config.authURL +
        '?response_type=code' +
        '&client_id=' + config.clientId +
        '&scope=' + config.scope +
        '&state=RNDM_' + getRandomString(18) +
        '&redirect_uri=' + config.redirectURL;

    return authrorisationCodeURL;
};

var generateAccessTokenPath = function (code) {

    var accessTokenPath = '/uas/oauth2/accessToken' +
        '?grant_type=authorization_code' +
        '&code=' + code +
        '&redirect_uri=' + config.redirectURL +
        '&client_id=' + config.clientId +
        '&client_secret=' + config.clientSecret;
    return accessTokenPath;
};

var getAuthorisationCode = function (req) {
    var queryString = url.parse(req.url, true).query;
    if (queryString.code) {
        return queryString.code;
    } else {
        return null;
    }
}

var getAccessToken = function (code, callback) {

    var accessTokenPath = generateAccessTokenPath(code);

    var options = {
        host: 'api.linkedin.com',
        port: 443,
        path: accessTokenPath
    };

    var secureRequestForToken = https.request(options, function (tokenServerResponse) {

        tokenServerResponse.on('data', function (result) {
            var access_token = JSON.parse(result).access_token;
            callback(access_token);
        });
    });

    secureRequestForToken.on('error', function (e) {
        console.error(e);
        callback(null);
    });
    secureRequestForToken.end();
};

var getRandomString = function (size) {
    size = parseInt(size);
    if (!size || size <= 0) size = 18;
    var randomString = "";
    var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    for (var i = 0; i < size; i++) {
        randomString += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return randomString;
}

var insert = function () {
    client.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err)
        }
        var query = "INSERT INTO linkedin_users(\"firstName\", \"lastName\", \"email\", \"linkedInID\") VALUES('" + userData.firstname + "', '" + userData.lastname + "', '" + userData.email + "', '" + userData.id + "')";
        console.log(query);

        if (client) {
            client.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                }
            });
        }
    });
};