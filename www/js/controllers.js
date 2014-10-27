angular.module('starter.controllers', [])
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('tabs.signin', {
			url: '/sign-in',
			templateUrl: 'templates/tabs.html',
			controller: 'SignInCtrl'
		})
		.state('tabs.signin', {
			url: '/home',
			templateUrl: 'templates/home.html'
		})

	$urlRouterProvider.otherwise('/sign-in');
})
.controller('DashCtrl', function($scope) {
})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});
