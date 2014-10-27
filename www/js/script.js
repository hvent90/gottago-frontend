var app = angular.module('starter', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home')

  $stateProvider
    .state('sign-in', {
      url: '/sign-in',
      templateUrl: 'sign-in.html',
      controller: 'SignInController'
    })
    .state('home', {
      url: '/home',
      templateUrl: 'home.html'
    })
});

app.controller('SignInController', function($scope, $state, $http, $ionicModal, Auth, UserProperties, SessionService, HouseService) {
  $scope.errors = 'hello';
  $ionicModal.fromTemplateUrl('log-in.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.lModal = modal
  });

  $ionicModal.fromTemplateUrl('register.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.rModal = modal
  });

  $scope.loginModal = function() {
    $scope.lModal.show();
  }
  $scope.registerModal = function() {
    $scope.rModal.show();
  }

  $scope.closeModal = function() {
    $scope.lModal.hide();
    $scope.rModal.hide();
  }

  $scope.$on('$destroy', function() {
    $scope.lModal.remove();
    $scope.rModal.remove();
  });

  $scope.register = function (user) {
    console.log(user);
    Auth.register(user)
      .success(function (data) {
        $scope.signIn(user);
      })
  }

  $scope.signIn = function(user) {
    Auth.login(user)
      .success(function(data) {
        if(data.id) {
          console.log(data);
          $scope.user = data;
          UserProperties.setUser(data);
          SessionService.set('auth', true); //This sets our session key/val pair as authenticated
          SessionService.set('id', data.id); //Saves User ID
          SessionService.set('shower', data.shower); //Saves User ID
          SessionService.set('pee', data.pee); //Saves User ID
          SessionService.set('poop', data.poop); //Saves User ID
          Auth.getHouses(SessionService.get('id'))
            .success(function(data) {
              console.log(data);
              console.log('wtf');
              if (data == false) {
                sessionStorage.setItem('defHouseId', 'NONE');
                console.log('true');
                $state.go('home');
              }
              if (data != false) {
                sessionStorage.setItem('defHouseId', data[0]['id']);
                $scope.houses = data;
                Auth.getTenants(SessionService.get('defHouseId'))
                  .success(function(data) {
                    $scope.tenants = data;
                    console.log($scope.tenants);
                    console.log('house id is ' + SessionService.get('defHouseId'));
                    $state.go('home');
                  });
              }
            });
        } else {
          alert('Could not verify your login');
        }
      })
      .error(function(data, status, headers, config) {
          $scope.errors = [data, status, headers, config];
          return $scope.errors;
        });
  };
});

app.controller('MainCtrl', function($scope, $state, $ionicModal, $ionicActionSheet, Auth, SessionService) {
  if(SessionService.get('id') == null) {
    $state.go('sign-in');
  }

  $scope.emergency = function(obj) {
    $ionicActionSheet.show({
      buttons: [
        { text: '<img style="" class="icon-action icon-action-shower" src="img/clouds.svg"></img>' },
        { text: '<img style="" class="icon-action icon-action-pee" src="img/lemon-dark.svg"></img>' },
        { text: '<img style="" class="icon-action icon-action-poop" src="img/turtle.svg"></img>' }
      ],
      titleText: 'Emergency!',
      cancelText: 'Cancel',
      cancel: function() {},
      buttonClicked: function(index, value) {
        return true;
      }
    });
  };

  $scope.pingTenants = function(obj) {
    $ionicActionSheet.show({
      buttons: [
        { text: '<img style="" class="icon-action icon-action-shower" src="img/clouds.svg"></img>' },
        { text: '<img style="" class="icon-action icon-action-pee" src="img/lemon-dark.svg"></img>' },
        { text: '<img style="" class="icon-action icon-action-poop" src="img/turtle.svg"></img>' }
      ],
      titleText: 'Does anyone need to use the bathroom before I...',
      cancelText: 'Cancel',
      cancel: function() {},
      buttonClicked: function(index, value) {
        return true;
      }
    });
  };

  $ionicModal.fromTemplateUrl('change-name.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })

  $scope.openModal = function() {
    $scope.modal.show();
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  }

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
});

app.controller('HouseController', function($scope, $state, $element, $ionicModal, $ionicActionSheet, UserProperties, HouseService, Auth, SessionService) {
  if(SessionService.get('id') == null) {
    $state.go('sign-in');
  } else {
  Auth.getHouses(SessionService.get('id'))
    .success(function(data) {
      $scope.houses = data;
    });
  }

  $scope.leaveHouse = function(house) {
    $scope.houseToLeave = {
      house_id  : house.id,
      tenant_id : SessionService.get('id')
    };
    $ionicActionSheet.show({
      buttons: [
        { text: 'I\'m out!' }
      ],
      titleText: 'Leave the house?',
      cancelText: 'Cancel',
      cancel: function() {},
      buttonClicked: function(houseToLeave) {
        console.log($scope.houseToLeave);
        Auth.leaveHouse($scope.houseToLeave)
          .success(function (data) {
            Auth.getHouses(SessionService.get('id'))
            .success(function(data) {
              console.log(data);
              console.log('wtf');
              if (data == false) {
                sessionStorage.setItem('defHouseId', 'NONE');
                console.log('true');
                $state.go('home');
              }
              if (data != false) {
                sessionStorage.setItem('defHouseId', data[0]['id']);
                $scope.houses = data;
                Auth.getTenants(SessionService.get('defHouseId'))
                  .success(function(data) {
                    $scope.closeModal();
                    $scope.tenants = data;
                    console.log($scope.tenants);
                    console.log('house id is ' + SessionService.get('defHouseId'));
                    $state.go('home');
                  });
              }
            });
          })
        return true;
      }
    })
  }


  $scope.ascertainSelected = function (house) {
    $scope.id = house.id;
    var elem = document.getElementById('house-' + $scope.id);
    elem = angular.element(elem);
    var defHouse = SessionService.get('defHouseId');
    if (house.id != defHouse) {
      elem.css('display', 'none');
      // $scope.elem = document.getElementById('house-' + $scope.id);
      // $scope.elem.empty();
    } else {
      elem.css('display', 'initial');
    }
  }

  $scope.ascertainSelectedId = function (houseId) {
    var elem = document.getElementById('house-' + houseId);
    elem = angular.element(elem);
    var defHouse = SessionService.get('defHouseId');
    if (houseId != defHouse) {
      elem.css('display', 'none');
      // $scope.elem = document.getElementById('house-' + $scope.id);
      // $scope.elem.empty();
    } else {
      elem.css('display', 'initial');
    }
  }

  $scope.selectHouse = function (houseId) {
    SessionService.set('defHouseId', houseId);

    angular.forEach($scope.houses, function(house) {
      $scope.ascertainSelectedId(house.id);
    })

    SessionService.set('updateTenants', 1);
    Auth.getTenants(houseId)
      .success(function (data) {
        UserProperties.setNewTenants(data);
      });
  }

  $scope.joinHouseModal = function() {

  }

  $scope.createHouseModal = function() {

  }

  $scope.joinHouse = function(house) {
    house.tenant_id = SessionService.get('id');
    Auth.joinHouse(house)
      .sucess(function (data) {
        Auth.getHouses(SessionService.get('id'))
            .success(function(data) {
              console.log(data);
              console.log('wtf');
              if (data == false) {
                sessionStorage.setItem('defHouseId', 'NONE');
                console.log('true');
                $state.go('home');
              }
              if (data != false) {
                sessionStorage.setItem('defHouseId', data[0]['id']);
                $scope.houses = data;
                Auth.getTenants(SessionService.get('defHouseId'))
                  .success(function(data) {
                    $scope.closeModal();
                    $scope.tenants = data;
                    console.log($scope.tenants);
                    console.log('house id is ' + SessionService.get('defHouseId'));
                    $state.go('home');
                  });
              }
            });
      })
  }

  $scope.createHouse = function(house) {
    house.tenant_id = SessionService.get('id');
    $scope.closeModal();
    Auth.createHouse(house)
      .success(function (data) {
        Auth.getHouses(SessionService.get('id'))
            .success(function(data) {
              console.log(data);
              console.log('wtf');
              if (data == false) {
                sessionStorage.setItem('defHouseId', 'NONE');
                console.log('true');
                $state.go('home');
              }
              if (data != false) {
                sessionStorage.setItem('defHouseId', data[0]['id']);
                $scope.houses = data;
                Auth.getTenants(SessionService.get('defHouseId'))
                  .success(function(data) {
                    $scope.tenants = data;
                    console.log($scope.tenants);
                    console.log('house id is ' + SessionService.get('defHouseId'));
                    $state.go('home');
                  });
              }
            });
      })
  }

  $ionicModal.fromTemplateUrl('join-house.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.jHModal = modal
  });

  $ionicModal.fromTemplateUrl('create-house.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.cHModal = modal
  });

  $scope.joinHouseModal = function() {
    $scope.jHModal.show();
  }
  $scope.createHouseModal = function() {
    $scope.cHModal.show();
  }

  $scope.closeModal = function() {
    $scope.jHModal.hide();
    $scope.cHModal.hide();
  }

  $scope.$on('$destroy', function() {
    $scope.jHModal.remove();
    $scope.cHModal.remove();
  });

});

app.controller('TenantController', function($scope, $state, $element, $ionicTabsDelegate, $ionicModal, $ionicActionSheet, UserProperties, HouseService, Auth, SessionService) {
  if(SessionService.get('id') == null) {
    $state.go('sign-in');
  }

  $scope.updateTenants = function() {
    if (SessionService.get('updateTenants') == 1) {
      $scope.tenants = UserProperties.getNewTenants();
    }
    $ionicTabsDelegate.$getByHandle('tenants-tab').select(0);
  }

  $scope.houseTab = function() {
    $ionicTabsDelegate.$getByHandle('houses-tab').select(0);
  }

  $scope.userShower = SessionService.get('shower');
  $scope.userPee = SessionService.get('pee');
  $scope.userPoop = SessionService.get('poop');


  $scope.ascertainUrgency = function (urgency) {
    if (urgency == 'I Need to Really Badly') {
      return 'button-assertive';
    } else if (urgency == 'Just a Little Bit') {
      return 'button-energized';
    } else {
      return 'button-balanced';
    }
  }

  $scope.ascertainUrgencywtf = function (urgency) {
    console.log(urgency);
    if (urgency == 'I Need to Really Badly') {
      return 'button-assertive';
    } else if (urgency == 'Just a Little Bit') {
      return 'button-energized';
    } else {
      return 'button-balanced';
    }
  }

  $scope.ascertainUrgencyWithUser = function (activity) {
      // Auth.getUser(SessionService.get('id'))
      //   .success(function (data) {
      //     if (activity == 'shower') {
      //       return data.shower;
      //     } else if (activity == 'pee') {
      //       return data.pee;
      //     } else {
      //       return data.poop;
      //     }
      //   });
  }

  var userId = SessionService.get('id');
  $scope.userId = userId;
  if(SessionService.get('id') == null) {
    $state.go('sign-in');
  } else {
    Auth.getHouses(SessionService.get('id'))
      .success(function(data) {
        console.log('auth.gethouses is ' + data);
        $scope.houses = data;
        Auth.getTenants(SessionService.get('defHouseId'))
        .success(function(data) {
          $scope.tenants = data;
          console.log($scope.tenants);
          console.log('house id is ' + SessionService.get('defHouseId'));
        });
    });
  }

  $scope.logResult = function() {
      console.log($scope.result);
      console.log('test');
  };

  $scope.showerStatus = 'button-balanced';
  $scope.peeStatus    = 'button-balanced';
  $scope.poopStatus   = 'button-balanced';
  $scope.balanced     = 'button-balanced';
  $scope.energized    = 'button-energized';
  $scope.assertive    = 'button-assertive';

  $scope.showDetails = function(obj, tenant) {
    $scope.tempButtonClass;
    $scope.showDetails(obj, tenant);
    console.log('wTF');
    console.log('test' + $scope.tempButtonClass);
    return $scope.tempButtonClass;
  }

  $scope.showDetails = function(obj, tenant) {
    var elem = angular.element(obj.srcElement);
    $scope.id = obj.target.attributes.id.value;
    console.log("tenant-"+$scope.userId+"-"+$scope.id);
    var result = document.getElementsByClassName("tenant-"+$scope.userId+"-"+$scope.id);
    var elemItem = angular.element(result)
    $scope.result = null;
    $ionicActionSheet.show({
     buttons: [
       { text: 'I Need to Really Badly' },
       { text: 'Just a Little Bit' },
       { text: 'I\'m Relieved!' },
     ],
     titleText: 'I Need to Go...',
     cancelText: 'Cancel',
     cancel: function() {},
     buttonClicked: function(index, value, id) {
      Auth.setActivityUrgency(obj.target.attributes.id.value, value.text, $scope.userId)
        .success(function(data) {
          console.log(data);
        });
        elem
          .removeClass('button-assertive')
          .removeClass('button-energized')
          .removeClass('button-balanced');
        elemItem
          .removeClass('button-assertive')
          .removeClass('button-energized')
          .removeClass('button-balanced');

        $scope.tempButtonClass = value.text;

       if ( value.text == 'I Need to Really Badly' ) {
        if ( $scope.id == 'shower' ) {
          elem.addClass('button-assertive');
          elemItem.addClass('button-assertive');
          $scope.showerStatus = 'button-assertive';
          SessionService.set('shower', "I Need to Really Badly");
          $scope.userShower = 'button-assertive';
        } else if ( $scope.id == 'pee' ) {
          $scope.peeStatus = 'button-assertive';
          elem.addClass('button-assertive');
          elemItem.addClass('button-assertive');
          SessionService.set('pee', "I Need to Really Badly");
          $scope.userPee = 'button-assertive';
        } else {
          $scope.poopStatus = 'button-assertive';
          elem.addClass('button-assertive');
          elemItem.addClass('button-assertive');
          SessionService.set('poop', "I Need to Really Badly");
          $scope.userPoop = 'button-assertive';
        }
       } else if ( value.text == 'Just a Little Bit' ) {
        if ( $scope.id == 'shower' ) {
          $scope.showerStatus = 'button-energized';
          elem.addClass('button-energized');
          elemItem.addClass('button-energized');
          SessionService.set('shower', "Just a Little Bit");
          $scope.userShower = 'button-energized';
        } else if ( $scope.id == 'pee' ) {
          $scope.peeStatus = 'button-energized';
          elem.addClass('button-energized');
          elemItem.addClass('button-energized');
          SessionService.set('pee', "Just a Little Bit");
          $scope.userPee = 'button-energized';
        } else {
          $scope.poopStatus = 'button-energized';
          elem.addClass('button-energized');
          elemItem.addClass('button-energized');
          SessionService.set('poop', "Just a Little Bit");
          $scope.userPoop = 'button-energized';
        }
       } else {
        if ( $scope.id == 'shower' ) {
          $scope.showerStatus = 'button-balanced';
          elem.addClass('button-balanced');
          elemItem.addClass('button-balanced');
          SessionService.set('shower', "I'm Relieved!");
          $scope.userShower = 'button-balanced';
        } else if ( $scope.id == 'pee' ) {
          $scope.peeStatus = 'button-balanced';
          elem.addClass('button-balanced');
          elemItem.addClass('button-balanced');
          SessionService.set('pee', "I'm Relieved!");
          $scope.userPee = 'button-balanced';
        } else {
          $scope.poopStatus = 'button-balanced';
          elem.addClass('button-balanced');
          elemItem.addClass('button-balanced');
          SessionService.set('poop', "I'm Relieved!");
          $scope.userPoop = 'button-balanced';
        }
       }

       $scope.ascertainUrgency(value.text)

       return true;
     }
   });
  };
});

// app.directive('joinHouse', function($ionicTabsDelegate, SessionService) {
//   console.log('testsetset');
//   console.log('shit is ' + SessioNService.get('defHouseId'));
//   if (SessionService.get('defHouseId') == 'NONE') {
//     return {
//       restrict: 'E',
//       template: '<button class="button button-block button-positive" ng-click="houseTab()">Join or Create a House!</button>'
//     }
//   } else {
//     return null;
//   }
// });


app.factory('Auth', function($http, SessionService) {

  return {
    // get all the tenants of a household
    getTenants : function(houseId) {
      return $http.get(' http://localhost:8000/api/houses/getTenants?houseId=' + houseId);
    },

    getHouses : function(tenantId) {
        if(SessionService.get('id') == null) {
          return false;
        }
      return $http.get('http://localhost:8000/api/tenants/getHouses?tenantId=' + tenantId);
    },

    // set the activity urgency
    setActivityUrgency : function(activity, urgency, tenantId) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/api/tenants/seturgency',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        data: {
          activity: activity,
          urgency:  urgency,
          tenant:   tenantId
        }
      });
    },

    getUser : function(tenantId) {
      return $http.get('http://localhost:8000/api/tenants/getUser?id=' + tenantId)
    },

    // login a user
    login : function(userData) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/api/tenants/login',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        data: JSON.stringify(userData)
      });
    },

    //register a user
    register : function (userData) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/api/tenants/register',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        data: JSON.stringify(userData)
      })
    },

    // creates a house
    createHouse : function (houseData) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/api/houses/create-house',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        data: JSON.stringify(houseData)
      })
    },

    // joins a house
    joinHouse : function (houseData) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/api/houses/join-house',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        data: JSON.stringify(houseData)
      })
    },

    // leave a house
    leaveHouse : function (houseData) {
      return $http({
        method: 'POST',
        url: 'http://localhost:8000/api/houses/leave-house',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        data: JSON.stringify(houseData)
      })
    }
  }
});

app.factory('SessionService', function() {
  return {
    get : function(key) {
      return sessionStorage.getItem(key);
    },

    set : function(key, val) {
      return sessionStorage.setItem(key, val);
    },

    unset : function(key) {
      return sessionStorage.removeItem(key);
    }
  }
});

app.factory('HouseService', function(Auth, SessionService) {


  return {
    setFirst : function(data) {
      return sessionStorage.setItem('defHouseId', data[0]['id']);
    }
  }
});

app.service('UserProperties', function (SessionService) {
    var user;
    var tenants;

    return {
        setUser: function (val) {
            user = val;
        },
        getUser: function() {
            return user;
        },
        setNewTenants : function(data) {
          tenants = data;
        },

        getNewTenants : function() {
          SessionService.set('updateTenants', 0);
          return tenants;
        }
    };
});