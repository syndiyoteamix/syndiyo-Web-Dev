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
		templateUrl: '/templates/profile.html',
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
  $routeProvider.when('records/:recordsId', {
    controller: 'RecordsCtrl', 
    templateUrl: '/templates/records.html'
  })
  $routeProvider.when('/addRecords', {
    controller: 'AddRecordsCtrl', 
    templateUrl: '/templates/addRecords.html',
    resolve: { 
      'currentAuth': function($firebaseAuth) {
      return $firebaseAuth().$requireSignIn();
      }
    }
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
      $location.path('/profile');
    }).catch(function(error) {
        $scope.errorMsg = "Error: " + error;
        console.error("Error: ", error);
    })
  }
});

app.controller('HomeCtrl', function($scope, $firebaseArray, $firebaseAuth, $firebaseObject, currentAuth){
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

app.controller('AddRecordsCtrl', function(currentAuth, $scope, $firebaseArray){ 
  var HealthRecordsRef = firebase.database().ref().child('users').child(currentAuth.uid).child('healthRecords');
  $scope.healthRecords = $firebaseArray(HealthRecordsRef);
  $scope.uploadFile = function() { 
    var f = document.getElementById('file').files[0],
        r = new FileReader();
        console.log(f);
      r.onloadend = function(e){
        var data = e.target.result;
      } 
      r.readAsBinaryString(f);
    var storageRef = firebase.storage().ref(f.name);
    var uploadTask = storageRef.put(f);
    
    uploadTask.on('state_changed', function(snapshot){
      // Observe state change events such as progress, pause, and resume
      // See below for more detail
    }, function(error) {
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      $scope.downloadURL = uploadTask.snapshot.downloadURL;
      console.log($scope.downloadURL);
      $scope.healthRecords.$add({
        image: $scope.downloadURL, 
        title: $scope.imgTitle,
        category: $scope.imgCategory, 
        notes: $scope.imgNotes,
        created_at: Date.now()
      });


    });

  }

  // var imgRef = firebase.storage().ref('imageslionSex1.png');
  // storageRef.getDownloadURL().then(function(url) {
  // // Get the download URL for 'images/stars.jpg'
  // // This can be inserted into an <img> tag
  // // This can also be downloaded directly
  // }).catch(function(error) {
  // // Handle any errors
  // });


});

















