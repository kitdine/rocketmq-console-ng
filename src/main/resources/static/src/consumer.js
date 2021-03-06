/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var module = app;

module.controller('consumerController', ['$scope', 'ngDialog', '$http','Notification',function ($scope, ngDialog, $http,Notification) {
    $scope.paginationConf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 15,
        perPageOptions: [10],
        rememberPerPage: 'perPageItems',
        onChange: function () {
            $scope.showConsumerGroupList(this.currentPage,this.totalItems);
        }
    };
    $scope.allConsumerGrouopList = [];
    $scope.consumerGrouoShowList = [];
    $http({
        method: "GET",
        url: "/consumer/groupList.query"
    }).success(function (resp) {
        if(resp.status ==0){
            $scope.allConsumerGrouopList = resp.data;
            console.log($scope.allConsumerGrouopList);
            console.log(JSON.stringify(resp));
            $scope.showConsumerGroupList(1,$scope.allConsumerGrouopList.length);
        }else {
            Notification.error({message: resp.errMsg, delay: 2000});
        }
    });
    $scope.filterStr="";
    $scope.$watch('filterStr', function() {
        $scope.filterList(1);
    });
    $scope.filterList = function (currentPage) {
        var lowExceptStr =  $scope.filterStr.toLowerCase();
        var canShowList = [];
        $scope.allConsumerGrouopList.forEach(function(element) {
            console.log(element)
            if (element.group.toLowerCase().indexOf(lowExceptStr) != -1){
                canShowList.push(element);
            }
        });
        $scope.paginationConf.totalItems =canShowList.length;
        var perPage = $scope.paginationConf.itemsPerPage;
        var from = (currentPage - 1) * perPage;
        var to = (from + perPage)>canShowList.length?canShowList.length:from + perPage;
        $scope.consumerGrouoShowList = canShowList.slice(from, to);
    };


    $scope.showConsumerGroupList = function (currentPage,totalItem) {
        if($scope.filterStr != ""){
            $scope.filterList(currentPage);
            return;
        }
        var perPage = $scope.paginationConf.itemsPerPage;
        var from = (currentPage - 1) * perPage;
        var to = (from + perPage)>totalItem?totalItem:from + perPage;
        $scope.consumerGrouoShowList = $scope.allConsumerGrouopList.slice(from, to);
        $scope.paginationConf.totalItems = totalItem ;
        console.log($scope.consumerGrouoShowList)
        console.log($scope.paginationConf.totalItems)
    };
    $scope.openAddDialog = function () {
        $scope.openCreateOrUpdateDialog(null);
    };
    $scope.openCreateOrUpdateDialog = function(request){
        var bIsUpdate = true;
        if(request == null){
            request = [{
                brokerNameList: [],
                subscriptionGroupConfig: {
                    groupName: "",
                    consumeEnable: true,
                    consumeFromMinEnable: true,
                    consumeBroadcastEnable: true,
                    retryQueueNums: 1,
                    retryMaxTimes: 16,
                    brokerId: 0,
                    whichBrokerWhenConsumeSlowly: 1
                }
            }];
            bIsUpdate = false;
        }
        console.log(request);
        $http({
            method: "GET",
            url: "/cluster/list.query"
        }).success(function (resp) {
            if(resp.status ==0){
                console.log(resp);
                ngDialog.open({
                    template: 'consumerModifyDialog',
                    controller: 'consumerModifyDialogController',
                    data:{
                        consumerRequestList:request,
                        allClusterNameList:Object.keys(resp.data.clusterInfo.clusterAddrTable),
                        allBrokerNameList:Object.keys(resp.data.brokerServer),
                        bIsUpdate:bIsUpdate
                    }
                });
            }else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    };
    $scope.detail = function(consumerGroupName){
        $http({
            method: "GET",
            url: "/consumer/queryTopicByConsumer.query",
            params:{consumerGroup:consumerGroupName}
        }).success(function (resp) {
            if(resp.status ==0){
                console.log(resp);
                ngDialog.open({
                    template: 'consumerTopicViewDialog',
                    // controller: 'addTopicDialogController',
                    data:{consumerGroupName:consumerGroupName,data:resp.data}
                });
            }else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    };

    $scope.client = function(consumerGroupName){
        $http({
            method: "GET",
            url: "/consumer/consumerConnection.query",
            params:{consumerGroup:consumerGroupName}
        }).success(function (resp) {
            if(resp.status ==0){
                console.log(resp);
                ngDialog.open({
                    template: 'clientInfoDialog',
                    // controller: 'addTopicDialogController',
                    data:{data:resp.data,consumerGroupName:consumerGroupName}
                });
            }else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    };
    $scope.updateConfigDialog = function(consumerGroupName){
        $http({
            method: "GET",
            url: "/consumer/examineSubscriptionGroupConfig.query",
            params:{consumerGroup:consumerGroupName}
        }).success(function (resp) {
            if(resp.status ==0){
                console.log(resp);
                $scope.openCreateOrUpdateDialog(resp.data);
            }else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });


    };
    $scope.delete = function(consumerGroupName){
        $http({
            method: "GET",
            url: "/consumer/fetchBrokerNameList.query",
            params:{
                consumerGroup:consumerGroupName
            }
        }).success(function (resp) {
            if(resp.status ==0){
                console.log(resp);

                ngDialog.open({
                    template: 'deleteConsumerDialog',
                    controller: 'deleteConsumerDialogController',
                    data:{
                        // allClusterList:Object.keys(resp.data.clusterInfo.clusterAddrTable),
                        allBrokerNameList:resp.data,
                        consumerGroupName:consumerGroupName
                    }
                });
            }else {
                Notification.error({message: resp.errMsg, delay: 2000});
            }
        });
    }

}])

module.controller('deleteConsumerDialogController', ['$scope', 'ngDialog', '$http','Notification',function ($scope, ngDialog, $http,Notification) {
        $scope.selectedClusterList = [];
        $scope.selectedBrokerNameList = [];
        $scope.delete = function () {
            console.log($scope.selectedClusterList);
            console.log($scope.selectedBrokerNameList);
            console.log($scope.ngDialogData.consumerGroupName);
            $http({
                method: "POST",
                url: "/consumer/deleteSubGroup.do",
                data:{groupName:$scope.ngDialogData.consumerGroupName,
                    brokerNameList:$scope.selectedBrokerNameList}
            }).success(function (resp) {
                if(resp.status ==0){
                    Notification.info({message: "delete success!", delay: 2000});
                }else {
                    Notification.error({message: resp.errMsg, delay: 2000});
                }
            });
        }
    }]
);

module.controller('consumerModifyDialogController', ['$scope', 'ngDialog', '$http','Notification',function ($scope, ngDialog, $http,Notification) {
        $scope.postConsumerRequest = function (consumerRequest) {
            var request = JSON.parse(JSON.stringify(consumerRequest));
            console.log(request);
            $http({
                method: "POST",
                url: "/consumer/createOrUpdate.do",
                data:request
            }).success(function (resp) {
                if(resp.status ==0){
                    Notification.info({message: "update success!", delay: 2000});
                }else {
                    Notification.error({message: resp.errMsg, delay: 2000});
                }
            });
        }
    }]
);