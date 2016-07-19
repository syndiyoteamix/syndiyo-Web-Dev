var app = angular.module('syndiyoApp', ['ngRoute', 'firebase']);

app.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/login");
    }
  });
}]);

app.config(function($routeProvider){ 
	$routeProvider.when('/', { 
		controller: 'HomeCtrl',
		templateUrl: '/templates/home.html',
    resolve: { 
      'currentAuth': function($firebaseAuth) {
      return $firebaseAuth().$requireSignIn();
      }
    }
	})
  $routeProvider.when('/login', {
    controller: 'LoginCtrl', 
    templateUrl:'/templates/login.html'
  })
  $routeProvider.when('/signUp', {
    controller: 'SignUpCtrl', 
    templateUrl:'/templates/signUp.html'
  })
  $routeProvider.when('/medicalHistory', {
    controller: 'MedicalHistoryCtrl', 
    templateUrl: 'templates/medicalHistory.html',
    resolve: { 
      'currentAuth': function($firebaseAuth) {
       return $firebaseAuth().$requireSignIn();
      }
    }
  })
  $routeProvider.when('/insuranceInfo', {
    controller: 'InsuranceInfoCtrl', 
    templateUrl: 'templates/insuranceInfo.html',
    resolve: { 
      'currentAuth': function($firebaseAuth) {
       return $firebaseAuth().$requireSignIn();
      }
    }
  })
  $routeProvider.when('records/:recordsId', {
    controller: 'RecordsCtrl', 
    templateUrl: '/templates/records.html'
  })
  $routeProvider.when('request/:requestId', {
    controller: 'RequestCtrl', 
    templateUrl: '/templates/request.html'
  })
  $routeProvider.when('send/:sendId', {
    controller: 'SendCtrl', 
    templateUrl: '/templates/send.html'
  })

});

app.controller('LoginCtrl', function($scope, $firebaseObject, $firebaseAuth) { 
  $scope.authObj = $firebaseAuth();

  $scope.login = function() { 
    
    $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password)
    .then(function(firebaseUser) {
    console.log("Signed in as:", firebaseUser.uid);
    window.location.assign('/');

    }).catch(function(error) {
    console.error("Authentication failed:", error);
    })
  }
});

app.controller('SignUpCtrl', function($scope, $firebaseArray, $firebaseObject, $firebaseAuth, $location){ 
  $scope.authObj = $firebaseAuth();
  $scope.errorMsg = "";
  $scope.signUp = function () { 
    $scope.errorMsg = "";
    if ($scope.password !== $scope.password2)
    {
        console.log($scope.password, $scope.password2);
        $scope.errorMsg = "Passwords do not match";
        console.log($scope.errorMsg);
        return;
    }
    $scope.authObj.$createUserWithEmailAndPassword($scope.email, $scope.password)
    .then(function(firebaseUser) {
      var userInfoRef = firebase.database().ref().child('users').child(firebaseUser.uid).child('basicInfo');
      $scope.userInfo = $firebaseObject(userInfoRef);
      $scope.userInfo.firstName = $scope.firstName;
      $scope.userInfo.lastName = $scope.lastName;
      $scope.userInfo.email = $scope.email;
      $scope.userInfo.DOB = $scope.DOB;
      $scope.userInfo.SSN = $scope.SSN;
      $scope.userInfo.$save();
      $location.path('/medicalHistory');
    }).catch(function(error) {
        $scope.errorMsg = "Error: " + error;
        console.error("Error: ", error);
    })
  }
});
app.controller('MedicalHistoryCtrl', function($scope, $firebaseArray, $firebaseAuth, $firebaseObject, currentAuth, $location){ 
   var medHistoryRef = firebase.database().ref().child('users').child(currentAuth.uid).child('medHistory');
   $scope.medHistory = $firebaseObject(medHistoryRef);
   $scope.prevConditions = $firebaseArray(medHistoryRef.child('prevConditions'));
   $scope.allergies = $firebaseArray(medHistoryRef.child('allergies'));
   $scope.medications = $firebaseArray(medHistoryRef.child('medications'));
   $scope.addCondition = function() {
        $scope.prevConditions.$add($scope.newCondition);
        $scope.newCondition = "";
   }
   $scope.addAlergy = function() {
        $scope.allergies.$add($scope.newAlergy);
        $scope.newAllergy = "";
   }
   $scope.addMedication = function() {
        $scope.medications.$add($scope.newMedication);
        $scope.newMedication = "";
   }
   $scope.updateInfo = function () { 
        $scope.medHistory.weight = $scope.weight;
        $scope.medHistory.height = $scope.heightFT + "'" + $scope.heightInches;
        $scope.medHistory.$save();
        $location.path('/insuranceInfo');
    }
});
app.controller('InsuranceInfoCtrl', function($scope, $firebaseArray, $firebaseAuth, $firebaseObject, currentAuth){ 
   var insuranceInfoRef = firebase.database().ref().child('users').child(currentAuth.uid).child('insuranceInfo');
   $scope.insuranceInfo = $firebaseObject(insuranceInfoRef);
   $scope.updateInfo = function() {
        $scope.insuranceInfo.planProvider = $scope.planProvider;
        $scope.insuranceInfo.planType = $scope.planType;
        $scope.insuranceInfo.groupNumber = $scope.groupNumber;
        $scope.insuranceInfo.phoneNumber = $scope.memberID;
        $scope.insuranceInfo.phoneNumber = $scope.phoneNumber;
        $scope.insuranceInfo.policyNumber = $scope.policyNumber;
        $scope.insuranceInfo.$save();
    }
});



app.controller('HomeCtrl', function($scope, $firebaseObject, $firebaseAuth, currentAuth) { 
  $scope.curUser = currentAuth; 
  var ref = firebase.database().ref().child('channels');
  $scope.channels = $firebaseObject(ref);
});
















