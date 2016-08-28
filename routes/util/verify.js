var GROUP_TYPE = {
    NORMAL:'normal', //�Է����ʱ�
    BILL:'bill', //�����ʱ�
    FUND:'fund' //�����
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