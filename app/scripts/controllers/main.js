'use strict';

/**
 * @ngdoc function
 * @name espressoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the espressoApp
 */
angular.module('espressoApp')
  .controller('MainCtrl', function ($scope, localStorageService) {
    var pagesInStore = localStorageService.get('pages');
    var lastIDInStore = localStorageService.get('lastID'); 
    
    $scope.categories = ['News','Bills','India','Technology','Business','Entertainment','Blog','Other','Work'];

    $scope.pages = pagesInStore || [];
    $scope.lastID = lastIDInStore || 0;
    $scope.prevSelectedCategory = null;

    $scope.$watch('pages', function () {
      localStorageService.set('pages', $scope.pages);
    }, true);

    $scope.$watch('lastID', function () {
      localStorageService.set('lastID', $scope.lastID);
    }, true);

    $scope.removePage = function (index) {
      $scope.pages.splice(index, 1);
    };
  });

angular.module('espressoApp').controller('ModalDemoCtrl', function ($scope, $modal, $log) {

    $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'AddPageModal.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        pages: function () {
          return $scope.pages;
        },
        categories: function(){
          return $scope.categories;
        },
        prevSelectedCategory: function() {
        	return $scope.prevSelectedCategory;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.prevSelectedCategory = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
angular.module('espressoApp').controller('ModalInstanceCtrl', function ($scope, $modalInstance, pages, categories, prevSelectedCategory) {

  $scope.pages = pages;
  $scope.categories = categories;
  $scope.selected = {
    category: prevSelectedCategory || $scope.categories[0]
  };

  $scope.ok = function () {
    $scope.lastID++;
    var newPage = {id:$scope.lastID,'caption':$scope.caption,'link':$scope.link,'category':$scope.selected.category};
    $scope.pages.push(newPage);
    $scope.caption = '';
    $scope.link = '';
    $modalInstance.close($scope.selected.category);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.changeCategory = function (index) {
    $scope.selected = {
      category: $scope.categories[index]
    };
  };
});