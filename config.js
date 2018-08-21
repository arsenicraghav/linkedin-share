var config = {};

config.port = 3000;

config.host = '0.0.0.0';


config.clientId = "81as6hp3uip";

config.clientSecret = "ophsjdhzbkefh";

config.scope = 'w_share';

config.authURL = "https://www.linkedin.com/uas/oauth2/authorization";

if(process.env.PORT){
    config.redirectURL = "https://linkedin-share.herokuapp.com/callback";
    config.localDb = false;
}else{
    config.redirectURL = "http://localhost:3000/callback";
    config.localDb = true;
}

config.websiteLink = "https://conrati.com";

config.logo = "https://datafox-data.s3-us-west-1.amazonaws.com/images/cb_0180de1248af4e82beffb83ce99acd10.x0pvayv4ys65bspovgyb";

var module = module || {};
module.exports = config;
