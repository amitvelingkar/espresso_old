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
    
    $scope.categories = ['News','Bills','India','Technology','Business','Entertainment','Blog','Other','Work'];

    $scope.pages = pagesInStore || [];
    $scope.prevSelectedCategory = null;

    $scope.$watch('pages', function () {
      localStorageService.set('pages', $scope.pages);
    }, true);

    $scope.removePage = function (index) {
      $scope.pages.splice(index, 1);
    };
  });

angular.module('espressoApp').controller('ModalDemoCtrl', function ($scope, $modal, $log, localStorageService) {
    var lastIDInStore = localStorageService.get('lastID');
    $scope.lastID = lastIDInStore || 0;

    $scope.$watch('lastID', function () {
      localStorageService.set('lastID', $scope.lastID);
    }, true);

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
	        lastID: function() {
	        	return $scope.lastID;
	        },
	        prevSelectedCategory: function() {
	        	return $scope.prevSelectedCategory;
	        }
    	}
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.lastID = selectedItem.curID;
      $scope.prevSelectedCategory = selectedItem.category;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
angular.module('espressoApp').controller('ModalInstanceCtrl', function ($scope, $modalInstance, pages, categories, prevSelectedCategory, lastID) {

  $scope.pages = pages;
  $scope.categories = categories;
  $scope.alerts = [];
  $scope.selected = {
    category: prevSelectedCategory || $scope.categories[0],
    curID: lastID
  };

  $scope.ok = function () {
    $scope.alerts.length = 0;
    var hasError = false;
    var urlPattern = new RegExp("^(https?:\/\/)?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");
    var urlPatternStartsWithHttp = new RegExp("^(https?:\/\/)", "i");

    // URL validation
    if (!$scope.link || $scope.link.trim().length < 1) {
      $scope.alerts.push({type: 'danger', msg: 'URL field cannot be empty'});
      hasError = true;
    } else {
      // prepend with http:// if missing
      if (!urlPatternStartsWithHttp.test($scope.link)) {
        // add http:// to URL
        $scope.link = 'http://' + $scope.link;
      }

      // check for URL validity
      if (!urlPattern.test($scope.link)) {
        $scope.alerts.push({type: 'danger', msg: 'Invalid URL String'});
        hasError = true;
      }
    }

    // caption validation
    if (!$scope.caption || $scope.caption.trim().length < 1) {
      $scope.alerts.push({type: 'danger', msg: 'Caption field cannot be empty'});
      hasError = true;
    }

    if (!hasError) {
      $scope.selected.curID++;
      var newPage = {id:$scope.selected.curID,'caption':$scope.caption,'link':$scope.link,'category':$scope.selected.category};
      $scope.pages.push(newPage);
      $scope.caption = '';
      $scope.link = '';
      $modalInstance.close($scope.selected);
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.changeCategory = function (index) {
  	$scope.selected.category = $scope.categories[index];
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
