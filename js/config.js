define([],function(){
  function config($routeProvider,$compileProvider) {
    $routeProvider.when("/", {templateUrl: "../html/partials/spotify.html"})
      .when("/home/:token", {templateUrl: "../html/partials/home.html", controller: "homeController"})
      .when("/help", {templateUrl: "../html/partials/help.html"})
      .otherwise({templateUrl: "../html/partials/spotify.html"});
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|spotify):/);
  }
  config.$inject=['$routeProvider','$compileProvider'];

  return config;
});
