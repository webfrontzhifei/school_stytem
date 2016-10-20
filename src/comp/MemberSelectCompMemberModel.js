/**
 * Created by sqchen on 12/19/14.
 */

LBF.define('qidian.comp.MemberSelectCompMemberModel', function (require, exports, module) {
    var Model = require('qidian.comp.Model'),
        _ = require('lib.underscore'),
        Promise = require('util.Promise'),
        Tasks = require('util.Tasks');

    exports = module.exports = Model.extend({

        defaults: function() {
            return {
                /**
                 * list = [{name: '', account: '', disable: true|false, id: '', gender: '', icon: ''}]
                 */
                list: [],

                // totalAllowed 成员人数
                totalAllowed: 0,

                // 0代表无操作，1代表增加，-1代表删除
                // 早就在list里面, 其值只能是 -1 -> 0 -> -1 分别代表，被删除，加回来了，被删除
                // 之前不在list里面的，其值只能是 +1 -> 0 -> +1 分别代表，新加的，又删了，新加的
                operationList: {}
            }
        },

        addMember: function(member) {
            var promise = new Promise,
                model = this,
                totalAllowed = this.get('totalAllowed'),
                list = this.get('list'),
                operationList = this.get('operationList');
            
            // 不存在才要加
            if(!this.checkExists(member.id)) {
                // 在添加之前先查看是否已经达到了totalAllowed的上限
                if(list.length >= totalAllowed) {
                    Tasks.once(function() {
                        promise.reject({
                            errCode: 'quota_full'
                        });
                    }).run();
                } else {
                    // 在添加时，检测当前号码在operationList里的值是多少, 来决定其值是多少
                    // 如果其在operationList里面无值，说明是从外面加进来的，赋其值为+1
                    if(typeof operationList[member.id] === 'undefined') {
                        operationList[member.id] = 1;
                    } else {
                        // 读取operationList[member.id]当前的值
                        // 如果＝0，说明这个号之前不在初始列表当中
                        if(operationList[member.id] == 0) {
                            operationList[member.id] = 1;
                        } else {
                            // 说明在初始列表当中
                            operationList[member.id] = 0;
                        }
                    }

                    list.push(member);

                    Tasks.once(function() {
                        promise.resolve(member.id);
                    }).run();
                }

            } else {
                Tasks.once(function() {
                    promise.reject({
                        errCode: 'already_exist'
                    });
                }).run()
            }

            return promise.promise();
        },

        delMember: function(id) {
            var promise = new Promise,
                model = this,
                list = this.get('list'),
                operationList = this.get('operationList');

            // 存在才要删除
            if(this.checkExists(id)) {
                // 在删除时，检测当前号码在operationList里的值是多少, 来决定其值是多少
                // 如果其在operationList里面无值，说明是从默认列表中删除的，赋其值为-1
                if(typeof operationList[id] === 'undefined') {
                    operationList[id] = -1;
                } else {
                    // 读取operationList[member.id]当前的值
                    // 如果＝0，说明这个号之前在初始列表当中
                    if(operationList[id] == 0) {
                        operationList[id] = -1;
                    } else {
                        // 说明不在初始列表当中
                        operationList[id] = 0;
                    }
                }

                for(var i = 0, length = list.length; i < length; i++) {
                    if(list[i].id == id) {
                        list.splice(i, 1);
                        //  model.trigger('change'); model.trigger('change')被删除，因为这是异步的，得致list区域会出现滚动条闪动
                        break;
                    }
                }

                Tasks.once(function() {
                    promise.resolve(id);
                }).run();

            } else {
                Tasks.once(function() {
                    promise.reject({
                        errCode: 'not_exist'
                    });
                }).run();
            }

            return promise.promise();
        },

        checkExists: function(id) {
            var model = this,
                list = model.get('list');

            var exists = false;

            for(var i = 0, length = list.length; i < length; i++) {
                if(list[i].id == id) {
                    exists = true;
                    break;
                }
            }

            return exists;
        }
    });
});
