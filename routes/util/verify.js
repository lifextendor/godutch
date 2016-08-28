var GROUP_TYPE = {
    NORMAL:'normal', //吃饭团帐本
    BILL:'bill', //合租帐本
    FUND:'fund' //活动经费
};
module.exports = {
    verfyGroup:function(group){
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
    }
};