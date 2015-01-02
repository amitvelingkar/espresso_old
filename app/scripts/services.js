'use strict';

// scripts/services.js
angular.module('espressoApp.services', [])
.factory('UserService', function($q, $http, AWSService) {
  var service = {
    _user: null,
    UsersTable: 'Users',
    UsersPagesTable: 'UsersPages',
    setCurrentUser: function(u) {
      if (u && !u.error) {
        AWSService.setToken(u.id_token);
        return service.currentUser();
      } else {
        var d = $q.defer();
        d.reject(u.error);
        return d.promise;
      }
    },
    currentUser: function() {
    	var d = $q.defer();
    	if (service._user) {
    		d.resolve(service._user);
    	} else {
    		
			// After we've loaded the credentials
			AWSService.credentials().then(function() {
			gapi.client.oauth2.userinfo.get()
				.execute(function(e) {
					var email = e.email;
				    // Get the dynamo instance for the
				    // UsersTable
				    AWSService.dynamo({
				    	params: {TableName: service.UsersTable}
				    })
				    .then(function(table) {
				      // find the user by email
				      table.getItem({
				      	Key: {'User email': {S: email}}
				      }, function(err, data) {
				      	if (Object.keys(data).length === 0) {
				            // User didn't previously exist
				            // so create an entry
				            var itemParams = {
				            	Item: {
				            		'User email': {S: email}, 
				            		data: { S: JSON.stringify(e) }
				            	}
				            };
				            table.putItem(itemParams, 
				            	function(err, data) {
				            		service._user = e;
				            		d.resolve(e);
				            	});
				        } else {
				            // The user already exists
				            service._user = 
				            JSON.parse(data.Item.data.S);
				            d.resolve(service._user);
				        }
				    	});
			  		});
				});
			});
		}
		return d.promise;
    },
    uploadPage: function(page) {
    var d = $q.defer();
    service.currentUser().then(function(user) {
      // Get the dynamo instance for the
      // UsersPagesTable
      AWSService.dynamo({
        params: {TableName: service.UsersPagesTable}
      })
      .then(function(table) {
        // TODO - check if URL alreday exists
        var itemParams = {
        Item: {
          'Page url': {S: page.link},
          'User email': {S: user.email}, 
          data: {
            S: JSON.stringify({
              link: page.link,
              caption: page.caption,
              category: page.category
            })
            }
          }
        };
        table.putItem(itemParams, function(err, data) {
          d.resolve(data);
        });
      });
    });
  return d.promise;
  },
  Pages: function() {
    var d = $q.defer();
    service.currentUser().then(function(user) {
      AWSService.dynamo({
        params: {TableName: service.UsersPagesTable}
      }).then(function(table) {
        table.query({
          TableName: service.UsersPagesTable,
          KeyConditions: {
            "User email": {
              "ComparisonOperator": "EQ",
              "AttributeValueList": [
                {S: user.email}
              ]
            }
          }
        }, function(err, data) {
          var pages = [];
          if (data) {
            angular.forEach(data.Items, function(item) {
              pages.push(JSON.parse(item.data.S));
            });
            d.resolve(pages);
          } else {
            d.reject(err);
          }
        })
      });
    });
    return d.promise;
  }
  };
  return service;
})
.provider('AWSService', function() {
  var self = this;
    // Set defaults
  AWS.config.region = 'us-east-1';

  self.arn = null;

  self.setArn = function(arn) {
    if (arn) {
    	self.arn = arn;
    }
  };
  
  self.setRegion = function(region) {
    if (region) AWS.config.region = region;
  };
 
  self.setLogger = function(logger) {
    if (logger) AWS.config.logger = logger;
  };

self.$get = function($q, $cacheFactory) {
	var dynamoCache = $cacheFactory('dynamo'),
      credentialsDefer = $q.defer(),
      credentialsPromise = credentialsDefer.promise;

    return {
      credentials: function() {
        return credentialsPromise;
      },
      setToken: function(token, providerId) {
      	var config = {
      		RoleArn: self.arn,
      		WebIdentityToken: token,
      		RoleSessionName: 'web-id'
      	};
      	if (providerId) {
      		config['ProviderId'] = providerId;
      	}
      	self.config = config;
      	AWS.config.credentials = 
      	new AWS.WebIdentityCredentials(config);
      	credentialsDefer
      	.resolve(AWS.config.credentials);
      },
      dynamo: function(params) {
		var d = $q.defer();
		credentialsPromise.then(function() {
			var table = dynamoCache.get(JSON.stringify(params));
			if (!table) {
				table = new AWS.DynamoDB(params);
				dynamoCache.put(JSON.stringify(params), table);
			}
			d.resolve(table);
		});
		return d.promise;
      }
    };
  };
});