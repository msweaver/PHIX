/*=======================================================================
Copyright 2013 Amida Technology Solutions (http://amida-tech.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
======================================================================*/

angular.module('phix.inboxCtrl', ['phix.utilityService']).controller('InboxCtrl',
  [ '$rootScope',
    '$scope',
    'UtilityService',
    'MailService',
  function ($rootScope, $scope, utils, mailService) {

    // Initialize the inbox service and call the method to grab the inbox from it.
    mailService.initializeMailbox
      .then(function ()               { return mailService.getMailbox('/direct/inbox'); })
      .then(function (messages)       { return mailService.process(messages, 'inbox');  })
      .then(function (inboxMessages)  { $scope.inboxMessages = inboxMessages;           });


    // Core messages that need current $scope.
    $scope.selectMessage = function (message) {
      mailService.selectMessage(message);
    };

    // Events coming from the base mail service.
    $scope.$on('inbox:toggleSelectAll', function (selectedState) {
      var i = 0;
      for ( ; i < $scope.inboxMessages.length; i += 1) {
        mailService.selectMessage($scope.inboxMessages[i]);
      }
    });

}]);