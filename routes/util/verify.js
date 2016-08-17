var GROUP_TYPE = {
    NORMAL:'normal',
    ACOUNT_BOOK:'accountBook'
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
        if(type !== GROUP_TYPE.ACOUNT_BOOK){
            return GROUP_TYPE.NORMAL;
        }
        return type;
    }
};