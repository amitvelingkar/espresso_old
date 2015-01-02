'use strict';

/**
 * @ngdoc function
 * @name espressoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the espressoApp
 */
angular.module('espressoApp')
  .controller('MainCtrl', ['$scope', 'AWSService', 'UserService', function ($scope, AWSService, UserService) {
    $scope.signedIn = function(oauth) {
      UserService.setCurrentUser(oauth)
      .then(function(user) {
        $scope.user = user;
      });
    };
  }])
  .controller('ModalDemoCtrl', ['$scope', '$modal', '$log', 'localStorageService', 'UserService', function ($scope, $modal, $log, localStorageService, UserService) {
    //var pagesInStore = localStorageService.get('pages');
    var lastIDInStore = localStorageService.get('lastID');
    
    $scope.categories = ['News','Bills','India','Technology','Business','Entertainment','Blog','Other','Work'];
    $scope.prevSelectedCategory = null;
    $scope.lastID = lastIDInStore || 0;

    // TODO - create a way to custom sort
    // most likley this will have to inviolved watch on scope and secondary index in dynamo db

    $scope.removePage = function (index) {
      UserService.removePage($scope.pages[index])
      .then(function(data) {
        getPages();
      });

    };

    $scope.$watch('lastID', function () {
      localStorageService.set('lastID', $scope.lastID);
    }, true);

    var getPages = function() {
      UserService.Pages()
      .then(function(pages) {
        $scope.pages = pages;
      });
    };

    getPages();

    $scope.open = function (size) {
    	var modalInstance = $modal.open({
	      templateUrl: 'AddPageModal.html',
	      controller: 'ModalInstanceCtrl',
	      size: size,
	      resolve: {
	        categories: function(){
	          return $scope.categories;
	        },
	        prevSelectedCategory: function() {
	        	return $scope.prevSelectedCategory;
	        }
    	}
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.lastID++; // update last used ID
      $scope.prevSelectedCategory = selectedItem.category; // remember lst value
      
      // upload new page to service
      var newPage = {'id':$scope.lastID,'caption':selectedItem.caption,'link':selectedItem.link,'category':selectedItem.category};
      UserService.uploadPage(newPage)
      .then(function(page) {
        // TODO - page sort order
        getPages();
      });

    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}])
.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'categories', 'prevSelectedCategory', function ($scope, $modalInstance, categories, prevSelectedCategory) {
  $scope.categories = categories;
  $scope.alerts = [];
  $scope.selected = {
    caption: '',
    link: '',
    category: prevSelectedCategory || $scope.categories[0]
  };

  $scope.ok = function () {
    $scope.alerts.length = 0;
    var hasError = false;
    var urlPattern = new RegExp('^(https?:\/\/)?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?', 'i');
    var urlPatternStartsWithHttp = new RegExp('^(https?:\/\/)', 'i');

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

    // NO Errors - Close dialog and pass values to caller
    if (!hasError) {
      $scope.selected.caption = $scope.caption;
      $scope.selected.link = $scope.link;
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
}]);
