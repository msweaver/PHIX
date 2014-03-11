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

angular.module('phix.request', ['phix.requestCtrl'])
  .directive('phRequest', [function () {
    return {
      restrict: 'E',
      templateUrl: 'partials/request',
      controller: 'RequestCtrl',
      scope: true,
      link: function (scope, elem, attrs) {
        elem.find('.modal').on('hidden.bs.modal', function () {
          scope.$apply(function () {
            scope.reset();
          });
        });
      }
    }
  }]);