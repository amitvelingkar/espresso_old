'use strict';

/**
 * @ngdoc function
 * @name espressoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the espressoApp
 */
angular.module('espressoApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
