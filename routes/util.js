/**
 * Created by vein on 2016/9/5.
 */
var GROUP_TYPE = {
    NORMAL:'normal', //吃饭团帐本
    BILL:'bill', //合租帐本
    FUND:'fund' //活动经费
};
module.exports = {
    verifyGroup:function(group){
        var result = true;
        if(group){
            result = result && (group.gname !== '');
            result = result && (group.description !== undefined);
        } else{
            result = false;
        }
        return result;
    },
    getGroupType:function(type){
        if(type !== GROUP_TYPE.BILL && type !== GROUP_TYPE.FUND){
            return GROUP_TYPE.NORMAL;
        }
        return type;
    },
    getGuid:function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};