'use strict';

/**
 * @ngdoc overview
 * @name espressoApp
 * @description
 * # espressoApp
 *
 * Main module of the application.
 */
angular
  .module('espressoApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.sortable',
    'ui.bootstrap',
    'ui.bootstrap.modal',
    'LocalStorageModule',
    'espressoApp.services',
    'espressoApp.directives'
  ])
  .config(['localStorageServiceProvider', function(localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('ls');
  }])
  .config(function(AWSServiceProvider) {
    AWSServiceProvider
      .setArn(
        'arn:aws:iam::647056934977:role/google-web-role');
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

  window.onLoadCallback = function() {
    // When the document is ready
    angular.element(document).ready(function() {
      // Bootstrap the oauth2 library
      gapi.client.load('oauth2', 'v2', function() {
        // Finally, bootstrap our angular app
        angular.bootstrap(document, ['espressoApp']);
      });
    });
  };