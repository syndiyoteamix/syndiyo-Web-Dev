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
  $routeProvider.when('/profile', {
    controller: 'ProfileCtrl', 
    templateUrl: 'templates/profile.html',
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
  //  TOOK OUT REQUEST ID FOR TESTING PURPOSES
  $routeProvider.when('/request', {
    controller: 'RequestCtrl', 
    templateUrl: '/templates/request.html',
    resolve: { 
      'currentAuth': function($firebaseAuth) {
       return $firebaseAuth().$requireSignIn();
      }
    }
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
      $location.path('/profile');
    }).catch(function(error) {
        $scope.errorMsg = "Error: " + error;
        console.error("Error: ", error);
    })
  }
});

app.controller('ProfileCtrl', function($scope, $firebaseArray, $firebaseAuth, $firebaseObject, currentAuth){
    var userRef = firebase.database().ref().child('users').child(currentAuth.uid);
    var medHistoryRef = userRef.child('medHistory');
    $scope.medHistory = $firebaseObject(medHistoryRef);
    $scope.prevConditions = $firebaseArray(medHistoryRef.child('prevConditions'));
    $scope.allergies = $firebaseArray(medHistoryRef.child('allergies'));
    $scope.medications = $firebaseArray(medHistoryRef.child('medications'));
    $scope.insuranceInfo = $firebaseObject(userRef.child('insuranceInfo'));
    $scope.doctors = $firebaseArray(userRef.child('doctors'));
    $scope.index = 0;
    $scope.addCondition = function() {
        $scope.prevConditions.$add($scope.newCondition);
        $scope.newCondition = "";
   }
   $scope.addAllergy = function() {
        $scope.allergies.$add($scope.newAllergy);
        $scope.newAllergy = "";
   }
   $scope.addMedication = function() {
        $scope.medications.$add($scope.newMedication);
        $scope.newMedication = "";
   }
   $scope.updateInfo = function () { 
        $scope.medHistory.$save();
    }
  $scope.addDoctor = function() {
        $scope.doctors.$add({
            'name': $scope.newDoctorName,
            'practiceName': $scope.newPracticeName,
            'category': $scope.category,
            'phone': $scope.newPhone,
            'email': $scope.newEmail,
            'fax': $scope.newFax
        })
    }
     $scope.updateInsurance = function() {
        $scope.insuranceInfo.$save();
    }
});

app.controller('RequestCtrl', function($scope, $firebaseObject, $firebaseAuth, currentAuth) { 
  var doctorRef = firebase.database().ref().child('users').child(currentAuth.uid).child('doctors');
  $scope.doctors = $firebaseObject(doctorRef);
  console.log($scope.doctors);


  $scope.sendMail = function() {
    var email = $scope.selectedDoctor.email;
    console.log($scope.selectedDoctor);
    window.location.href = ("mailto:" + email +'?subject=hello&body=the_body&attachment=pdf.pdf');
    $scope.selectedDoctor = "";
  };

  $scope.sendMail2 = function() {
      var email = $scope.recipient;

      window.location.href = ("mailto:" + email +'?subject=hello&body=the_body&attachment=pdf.pdf');
      
      // window.open('mailto:'+email+'?subject=hello&body=the_body');
      // window.open('mailto:'+email2+'?subject=hello&body=the_body');
      $scope.recipient = "";
    };
});
















